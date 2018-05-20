
const mongoose = require('mongoose');
const Joi = require('joi');
const Boom = require('boom');

module.exports = [
  {
    method: 'GET',
    path: '/api/procedura/insert/{name}/{TipoProcedura}',
    handler: (req, h) => {
      h.type = 'application/json';
      const Procedura = mongoose.model('Procedura');
      const newProcedura = new Procedura({
        Name: req.params.name,
        TipoProcedura: req.params.TipoProcedura,
        CreatedOn: Date.now(),
        Modified: Date.now(),
        Disabled: false,
      });
      return newProcedura.save();
    },
    options: {
      validate: {
        params: {
          name: Joi.string().min(3).required(),
          TipoProcedura: Joi.number().required(),
        },
      },
    },
  },
  {
    method: 'GET',
    path: '/api/procedura/update/{id}/{name}/{TipoProcedura}',
    handler: (req, h) => new Promise((resolve, reject) => {
      const Procedura = mongoose.model('Procedura');
      Procedura.findOneAndUpdate(
        { _id: req.params.id },
        {
          Name: req.params.name,
          TipoProcedura: req.params.TipoProcedura,
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
          name: Joi.string().min(3),
          TipoProcedura: Joi.number(),
        },
      },
    },
  },
  {
    method: 'GET',
    path: '/api/procedura/delete/{id}',
    handler: (req, h) => new Promise((resolve, reject) => {
      const Procedura = mongoose.model('Procedura');
      Procedura.findOneAndUpdate(
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
    path: '/api/procedura/getall',
    handler: (req, h) => {
      h.type = 'application/json';
      const Procedura = mongoose.model('Procedura');
      return Procedura.find({ Disabled: false }).exec();
    },
  },
  {
    method: 'GET',
    path: '/api/procedura/getbyid/{id}',
    handler: (req, h) => {
      h.type = 'application/json';
      const Procedura = mongoose.model('Procedura');
      return Procedura.find({ _id: req.params.id, Disabled: false }).exec();
    },
    options: {
      validate: {
        params: {
          id: Joi.string().required(),
        },
      },
    },
  },
];
