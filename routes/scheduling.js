const mongoose = require('mongoose');
const Joi = require('joi');
const Token = require('./../token');
const moment = require('moment')
module.exports = [{
  method: 'POST',
  path: '/api/scheduling/insert',
  handler: (req, h) => {
    return Token.isAuthenticated(req.payload.Token).then(isAuthenticated => {
      if (typeof (isAuthenticated) == "object") {
        h.type = 'application/json';
        var Scheduling = mongoose.model('Scheduling');
        var utente = isAuthenticated.account._id;
        var newScheduling = new Scheduling({
          Time: req.payload.Time,
          Dispositivi: req.payload.Dispositivi.split(","),
          Utente: utente,
          Giorno: req.payload.Giorno,
          CreatedOn: Date.now(),
          Modified: Date.now(),
          Disabled: false,
        });
        return newScheduling.save()
          .then((doc) => {
            return h.response(JSON.stringify(doc)).code(200)
          })
          .catch((err) => {
            return h.response(JSON.stringify({
              error: err
            })).code(400)
          });
      } else
        throw Boom.notFound('Cannot find the requested page')
    })
  },
  options: {
    cors: true,
    validate: {
      payload: {
        Time: Joi.string().required(),
        Dispositivi: Joi.string().required(),
        Token: Joi.string().required(),
        Giorno: Joi.string().required()
      },
    },
  },
},
{
  method: 'POST',
  path: '/api/scheduling/update',
  handler: (req, h) => {
    return Token.isAuthenticated(req.payload.Token).then(isAuthenticated => {
      if (typeof (isAuthenticated) == "object") {
        h.type = 'application/json';
        var Scheduling = mongoose.model('Scheduling');
        var utente = isAuthenticated.account._id;
        return new Promise((resolve, reject) => {
          Scheduling.updateOne({
            _id: req.payload.id,
            Utente: utente,
            Disabled: false
          }, {
              Time: req.payload.Time,
              Dispositivi: req.payload.Dsipositivi,
              Giorno: req.payload.Giorno,
              CreatedOn: Date.now(),
              Modified: Date.now(),
              Disabled: false,
            },
            (err, doc) => {
              if (err) reject(err);
              else {
                resolve()
              }
            });
        }).then(() => h.response().code(200))
          .catch((err) => h.response(JSON.stringify({
            error: err
          })).code(406))
      } else
        throw Boom.notFound('Cannot find the requested page')
    })

  },
  options: {
    cors: true,
    validate: {
      payload: {
        id: Joi.string().required(),
        Time: Joi.string().required(),
        Dispositivi: Joi.array().required(),
        Token: Joi.string().required(),
        Giorno: Joi.string().required()
      },
    },
  },
},
{
  method: 'GET',
  path: '/api/scheduling/getschedulebyuserandbygiorno/{Token}/{Giorno}',
  handler: (req, h) => {
    return Token.isAuthenticated(req.params.Token).then(isAuthenticated => {
      if (typeof (isAuthenticated) == "object") {
        h.type = 'application/json';
        var Scheduling = mongoose.model('Scheduling');
        var utente = isAuthenticated.account._id;
        var giorno = moment(req.params.Giorno, 'DD-MM-YYYY').toDate()
        return Scheduling.find({
          Utente: utente,
          Giorno: giorno,
          Disabled: false
        }).exec();
      } else
        throw Boom.notFound('Cannot find the requested page')
    })

  },
  options: {
    cors: true,
    validate: {
      params: {
        Token: Joi.string().required(),
        Giorno: Joi.string().required()
      },
    },
  },
},
{
  method: 'GET',
  path: '/api/scheduling/deletedispositivo/{Token}/{Slot}/{IndexDispositivo}',
  handler: (req, h) => {
    return Token.isAuthenticated(req.params.Token).then(isAuthenticated => {
      if (typeof (isAuthenticated) == "object") {
        h.type = 'application/json';
        var Scheduling = mongoose.model('Scheduling');
        var utente = isAuthenticated.account._id;
        var today = moment().format('MM/DD/YYYY');
        return Scheduling.find({
          Utente: utente,
          Giorno: today,
          Time: req.params.Slot,
          Disabled: false
        }).exec().then((schemes) => {
          return new Promise(resolve => {
            for (var i = 0; i < schemes.length; i++) {
              if (schemes[i].Dispositivi.length > 0 && schemes[i].Dispositivi[req.params.IndexDispositivo] != undefined) {
                console.log("schema", schemes[i])
                var disp = schemes[i]['Dispositivi'];
                console.log("schema", disp)
                disp.splice(req.params.IndexDispositivo, 1);
                console.log("schema", disp)
                return Scheduling.updateOne({
                  _id: schemes[i]._id,
                  Utente: utente,
                  Giorno: today,
                  Time: req.params.Slot
                }, { Dispositivi: disp }).exec().then(() => {
                    resolve();
                })
              }
            }
          }).then(()=>
          {
            return h.response("ok");
          })

        })
      } else
        throw Boom.notFound('Cannot find the requested page')
    })

  },
  options: {
    cors: true,
    validate: {
      params: {
        Token: Joi.string().required(),
        Slot: Joi.number().required(),
        IndexDispositivo: Joi.number().required()
      },
    },
  },
},
]