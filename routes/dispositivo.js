const mongoose = require('mongoose');
const Joi = require('joi');
const Token = require('./../token');
var Boom = require('boom')
var moment = require('moment')

module.exports = [{
    method: 'POST',
    path: '/api/dispositivo/insert',
    handler: (req, h) => {
      return Token.isAuthenticated(req.payload.Token).then(isAuthenticated => {
        if (typeof (isAuthenticated) == "object") {
          h.type = 'application/json';
          var utente = isAuthenticated.account._id;
          var Dispositivo = mongoose.model('Dispositivo');
          var newDispositivo = new Dispositivo({
            Name: req.payload.Name,
            Consumo: req.payload.Consumo,
            Utente: utente,
            CreatedOn: Date.now(),
            Modified: Date.now(),
            Disabled: false,
          });
          return newDispositivo.save()
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
          Name: Joi.string().required(),
          Consumo: Joi.string().required(),
          Token: Joi.string().required(),
        },
      },
    }
  },
  {
    method: 'POST',
    path: '/api/dispositivo/update',
    handler: (req, h) => {
      return new Promise((resolve, reject) => {
          return Token.isAuthenticated(req.payload.Token).then(isAuthenticated => {
            if (typeof (isAuthenticated) == "object") {
              h.type = 'application/json';
              var utente = isAuthenticated.account._id;
              var Dispositivo = mongoose.model('Dispositivo');
              Dispositivo.updateOne({
                _id: req.payload.Id,
                Utente: utente,
                Disabled: false
              }, {
                Name: req.payload.Name,
                Consumo: req.payload.Consumo,
                Modified: Date.now(),
              }, (err, doc) => {
                console.log(doc)
                if (err) return h.response(JSON.stringify({
                  error: err
                })).code(406);
                else resolve(doc);
              });
            } else
              throw Boom.notFound('Cannot find the requested page')
          })

        })
        .then((doc) => h.response(doc).code(200))
        .catch((err) => h.response(JSON.stringify({
          error: err
        })).code(406))

    },
    options: {
      cors: true,
      validate: {
        payload: {
          Id: Joi.strict().required(),
          Name: Joi.string().required(),
          Consumo: Joi.string().required(),
          Token: Joi.string().required(),
        },
      },
    }
  },
  {
    method: 'GET',
    path: '/api/dispositivo/delete/{id}/{Token}',
    handler: (req, h) => new Promise((resolve, reject) => {
        return Token.isAuthenticated(req.params.Token).then(isAuthenticated => {
          if (typeof (isAuthenticated) == "object") {
            var utente = isAuthenticated.account._id;
            var Dispositivo = mongoose.model('Dispositivo');
            Dispositivo.updateOne({
              _id: req.params.id,
              Utente: utente
            }, {
              Disabled: true,
              Modified: Date.now(),
            }, (err) => {
              if (err)
                reject(err);
              else {
                var Scheduling = mongoose.model('Scheduling');
                var today = moment().format('MM/DD/YYYY');
                Scheduling.find({
                    Utente: utente,
                    Giorno: today
                  }).exec()
                  .then((schemi) => {
                    for (var i = 0; i < schemi.length; i++) {
                      if (schemi[i].Dispositivi.includes(req.params.id)) {
                        var index = schemi[i].Dispositivi.indexOf(req.params.id);
                        schemi[i].Dispositivi.splice(index, 1)
                        Scheduling.updateOne({
                          _id: schemi[i]._id
                        }, {
                          Dispositivi: schemi[i].Dispositivi
                        }).exec()
                      }
                    }
                  })
                resolve();
              }

            });
          } else
            throw Boom.notFound('Cannot find the requested page')
        });
      }).then(() => h.response().code(200))
      .catch((err) => h.response(JSON.stringify({
        error: err
      })).code(406)),
    options: {
      cors: true,
      validate: {
        params: {
          id: Joi.string().required(),
          Token: Joi.string().required(),
        },
      },
    },
  },
  {
    method: 'GET',
    path: '/api/dispositivo/getall',
    handler: (req, h) => {
      h.type = 'application/json';
      const Dispositivo = mongoose.model('Dispositivo');
      return Dispositivo.find({
        Disabled: false
      }).exec();
    },
    options: {
      cors: true
    }
  },
  {
    method: 'GET',
    path: '/api/dispositivo/getbyid/{id}',
    handler: (req, h) => {
      h.type = 'application/json';
      const Dispositivo = mongoose.model('Dispositivo');
      return Dispositivo.find({
        _id: req.params.id,
        Disabled: false
      }).exec();
    },
    options: {
      cors: true,
      validate: {
        params: {
          id: Joi.string().required(),
        },
      },
    },
  },
  {
    method: 'GET',
    path: '/api/dispositivo/getdispositivibyutente/{Token}',
    handler: (req, h) => {
      return Token.isAuthenticated(req.params.Token).then(isAuthenticated => {
        if (typeof (isAuthenticated) == "object") {
          h.type = 'application/json';
          const Dispositivo = mongoose.model('Dispositivo');
          var id = isAuthenticated.account._id;
          var query = Dispositivo.find({
            Utente: id,
            Disabled: false
          })
          return query.exec();
        } else
          throw Boom.notFound('Cannot find the requested page')
      });
    },
    options: {
      cors: true,
      validate: {
        params: {
          Token: Joi.string().required(),
        },
      },
    },
  },
];
