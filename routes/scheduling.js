const mongoose = require('mongoose');
const Joi = require('joi');

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
              Scheduling.findOneAndUpdate({
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
                  else resolve();
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
]