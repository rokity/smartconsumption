const mongoose = require('mongoose');
const Joi = require('joi');
const Boom = require('boom');

module.exports = [
  {
    method: 'POST',
    path: '/api/evento/insert',
    handler: (req, h) => {
      h.type = 'application/json';
      const Evento = mongoose.model('Evento');
      const newEvento = new Evento({
        Time: req.payload.Time,
        TimeZone: req.payload.TimeZone,
        Procedura: req.payload.Procedura,
        CreatedOn: Date.now(),
        Modified: Date.now(),
        Disabled: false,
      });
      return newEvento.save();
    },
    options: {
      validate: {
        payload: {
          Time: Joi.string().min(5).max(5).required(),
          TimeZone: Joi.string().required(),
          Procedura: Joi.string().required(),
        },
      },
    },
  },
  {
    method: 'POST',
    path: '/api/evento/update',
    handler: (req, h) => new Promise((resolve, reject) => {
      const Evento = mongoose.model('Evento');
      Evento.findOneAndUpdate(
        { _id: req.payload.id, Disabled: false },
        {
          Time: req.payload.Time,
          TimeZone: req.payload.TimeZone,
          Procedura: req.payload.Procedura,
          Modified: Date.now(),
        }, (err) => {
          if (err) { reject(); } else { resolve(); }
        },
      );
    }).then(() => h.response().code(200))
      .catch(() => {
        throw Boom.badRequest('Unsupported parameter');
      }),
    options: {
      validate: {
        payload: {
          id: Joi.string().required(),
          Time: Joi.string().min(5).max(5),
          TimeZone: Joi.string(),
          Procedura: Joi.string(),
        },
      },
    },
  },
  {
    method: 'GET',
    path: '/api/evento/delete/{id}',
    handler: (req, h) => new Promise((resolve, reject) => {
      const Evento = mongoose.model('Evento');
      Evento.findOneAndUpdate(
        { _id: req.params.id },
        {
          Disabled: true,
          Modified: Date.now(),
        }, (err) => {
          if (err) { reject(); } else { resolve(); }
        },
      );
    }).then(() => h.response().code(200))
      .catch(() => {
        throw Boom.badRequest('Unsupported parameter');
      }),
    options: {
      validate: {
        params: {
          id: Joi.string().required(),
        },
      },
    },
  },
  {
    method: 'GET',
    path: '/api/evento/getall',
    handler: (req, h) => {
      h.type = 'application/json';
      const Evento = mongoose.model('Evento');
      return Evento.find({ Disabled: false }).exec();
    },
  },
  {
    method: 'GET',
    path: '/api/evento/getbyid/{id}',
    handler: (req, h) => {
      h.type = 'application/json';
      const Evento = mongoose.model('Evento');
      return Evento.find({ _id: req.params.id, Disabled: false }).exec();
    },
    options: {
      validate: {
        params: {
          id: Joi.string().required(),
        },
      },
    },
  },
  {
    method: 'GET',
    path: '/api/evento/deleteallbrute',
    handler: (req, h) => {
      h.type = 'application/json';
      const Evento = mongoose.model('Evento');
      return new Promise((resolve, reject) => {
        Evento.remove(
          {},
          (err) => {
            if (err) { reject(); } else { resolve(); }
          },
        );
      }).then(() => h.response().code(200))
        .catch(() => {
          throw Boom.badRequest('Unsupported parameter');
        });
    },
  },
];
