const mongoose = require('mongoose');
const Joi = require('joi');
const Token = require('./../token');
var Boom = require('boom')

module.exports = [{
  method: 'POST',
  path: '/api/dispositivo/insert',
  handler: (req, h) => {
    if (Token.isAuthenticated(req.payload)) {
      h.type = 'application/json';
      var utente = "";
      var utente = global.tokens[req.payload.Token].account._id;
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
      if (Token.isAuthenticated(req.payload)) {
        h.type = 'application/json';
        var utente = global.tokens[req.payload.Token].account._id;
        var Dispositivo = mongoose.model('Dispositivo');
        Dispositivo.findOneAndUpdate({
          _id: req.payload.id,
          Utente: utente,
          Disabled: false
        }, {
            Name: req.payload.Name,
            Consumo: req.payload.Consumo,
            Modified: Date.now(),
          }, (err, doc) => {

            if (err) return h.response(JSON.stringify({
              error: err
            })).code(406);
            else resolve();
          });
      }
      else
        throw Boom.notFound('Cannot find the requested page')
    })
      .then(() => h.response().code(200))
      .catch((err) => h.response(JSON.stringify({
        error: err
      })).code(406))

  },
  options: {
    cors: true,
    validate: {
      payload: {
        id: Joi.strict().required(),
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
    if (Token.isAuthenticated(req.params)) {
      var utente =global.tokens[req.params.Token].account._id;
      var Dispositivo = mongoose.model('Dispositivo');
      Dispositivo.findOneAndUpdate({
        _id: req.params.id,
        Utente:utente
      }, {
          Disabled: true,
          Modified: Date.now(),
        }, (err) => {
          if (err)
            reject(err);
          else
            resolve();
        });
    }
    else
      throw Boom.notFound('Cannot find the requested page')
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
  path: '/api/dispositivo/getdispositivibyutente/{token}',
  handler: (req, h) => {
    if (Token.isAuthenticated(req.params)) {
      h.type = 'application/json';
      const Dispositivo = mongoose.model('Dispositivo');
      var id = global.tokens[req.params.Token].account._id;
      return Dispositivo.find({
        Utente: id,
        Disabled: false
      }).exec();
    } else
      throw Boom.notFound('Cannot find the requested page')
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