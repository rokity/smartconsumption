
const mongoose = require('mongoose');
const Joi = require('joi');
const Boom = require('boom');

module.exports = [
  {
    method: 'POST',
    path: '/api/procedura/insert',
    handler: (req, h) => {
      h.type = 'application/json';
      const Procedura = mongoose.model('Procedura');
      const newProcedura = new Procedura({
        Name: req.payload.Name,
        Path : req.payload.Path,
        HttpMethod: req.payload.HttpMethod,        
        Parameters: req.payload.Parameters,
        CreatedOn: Date.now(),
        Modified: Date.now(),
        Disabled: false,
      });
      return newProcedura.save();
    },
    options: {
      validate: {
        payload: {
          Name: Joi.string().min(3).required(),
          Path: Joi.string().required(),
          HttpMethod: Joi.string().min(3).max(7).required(),
          Parameters : Joi.string()
        },
      },
    },
  },
  {
    method: 'POST',
    path: '/api/procedura/update',
    handler: (req, h) => new Promise((resolve, reject) => {
      const Procedura = mongoose.model('Procedura');
      Procedura.findOneAndUpdate(
        { _id: req.payload.id },
        {
          Name: req.payload.Name,
          Path : req.payload.Path,
          HttpMethod: req.payload.HttpMethod,        
          Parameters: req.payload.Parameters,
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
          Name: Joi.string().min(3),
          Path: Joi.string(),
          HttpMethod: Joi.string().min(3).max(7),
          Parameters : Joi.string()
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
  {
    method: 'GET',
    path: '/api/procedura/deleteallbrute',
    handler: (req, h) => {
      h.type = 'application/json';
      const Procedura = mongoose.model('Procedura');
      return new Promise((resolve,reject)=>
      {
        Procedura.remove({}, 
        (err)=>
        {
          if(err)
            reject();
          else
            resolve();
        })
      }).then(() => h.response().code(200))
      .catch(() => {
        throw Boom.badRequest('Unsupported parameter');
      })
      
    },
  },
];
