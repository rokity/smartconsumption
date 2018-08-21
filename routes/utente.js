const mongoose = require('mongoose');
const Joi = require('joi');
var Boom = require('boom')
var Token = require('./../token');
var moment = require('moment')

module.exports = [{
        method: 'POST',
        path: '/api/utente/registrazione',
        handler: (req, h) => {
            h.type = 'application/json';
            var Utente = mongoose.model('Utente');
            var newUtente = new Utente({
                Username: req.payload.Username,
                Password: req.payload.Password,
                CreatedOn: Date.now(),
                Modified: Date.now(),
                Disabled: false,
            });
            return newUtente.save()
                .then((doc) => {
                    return Token.tokenGenerator().then((value) => {
                        var expireDate = Token.expireDateGenerator()
                        var now = moment()
                        var diff = moment.duration(expireDate.diff(now)).asSeconds().toFixed();
                        global.clientRedis.set(value, JSON.stringify({
                            account: utente,
                            expireDate: expireDate.toString()
                        }), 'EX', diff)
                        return h.response(JSON.stringify({
                            token: value
                        })).code(200)
                    })
                })
                .catch((err) => {
                    return h.response(JSON.stringify({
                        error: err
                    })).code(400)
                });
        },
        options: {
            cors: true,
            validate: {
                payload: {
                    Username: Joi.string().min(5).required(),
                    Password: Joi.string().min(5).required(),
                },
            },
        }
    },
    {
        method: 'GET',
        path: '/api/utente/getusername/{token}',
        handler: (req, h) => {
            return Token.isAuthenticated(req.params).then(isAuthenticated => {
                if (typeof(isAuthenticated)=="object") {
                    h.type = 'application/json';
                    var Utente = mongoose.model('Utente');
                            return (Utente.find({
                                _id: isAuthenticated.account._id,
                                Disabled: false
                            }, 'Username').exec());

                } else
                    throw Boom.notFound('Cannot find the requested page')
            });

        },
        options: {
            cors: true,
            validate: {
                params: {
                    token: Joi.string().required(),
                },
            },
        }
    },
    {
        method: 'GET',
        path: '/api/utente/login/{Username}/{Password}',
        handler: (req, h) => {
            h.type = 'application/json';
            var Utente = mongoose.model('Utente');

            return Utente.findOne({
                    Username: req.params.Username,
                    Password: req.params.Password,
                    Disabled: false
                }).exec()
                .then((utente) => {
                    if (utente != null) {
                        return Token.tokenGenerator().then((value) => {
                            var expireDate = Token.expireDateGenerator()
                            var now = moment()
                            var diff = moment.duration(expireDate.diff(now)).asSeconds().toFixed();
                            global.clientRedis.set(value, JSON.stringify({
                                account: utente,
                                expireDate: expireDate.toString()
                            }), 'EX', diff)
                            return h.response(JSON.stringify({
                                token: value
                            })).code(200)
                        })
                    } else
                        throw Boom.notFound('Cannot find the requested page')
                });

        },
        options: {
            cors: true,
            validate: {
                params: {
                    Username: Joi.string().min(5).required(),
                    Password: Joi.string().min(5).required(),
                },
            },
        }
    },

]