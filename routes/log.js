const mongoose = require('mongoose');
const Joi = require('joi');
const Token = require('./../token');
var Boom = require('boom')

module.exports = [{
    method: 'POST',
    path: '/api/log/add',
    handler: (req, h) => {

        h.type = 'application/json';
        var Log = mongoose.model('Log');
        var newLog = new Log({
            Tipo: req.payload.tipo,
            Value: req.payload.value,
            CreatedOn: Date.now(),
        });
        return newLog.save();


    },
    options: {
        cors: true,
        validate: {
            payload: {
                tipo: Joi.string().required(),
                value: Joi.any().required(),
            },
        },
    },
}]