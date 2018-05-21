
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
        Hostname:req.payload.Hostname,
        Port:req.payload.Port,
        Path: req.payload.Path,        
        CreatedOn: Date.now(),
        Modified: Date.now(),
        Disabled: false,
      });
      return newProcedura.save()
            .then((doc) => 
            {
              return h.response(JSON.stringify(doc)).code(200)
            }) 
            .catch((err)=> 
            {
              return h.response(JSON.stringify(err)).code(400)
            })
    },
    options: {
      validate: {
        payload: {
          Name: Joi.string().min(3).required(),
          Hostname: Joi.string().min(3).required(),
          Port: Joi.number().required(),
          Path: Joi.string().required(),
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
        { _id: req.payload.id, Disabled: false },
        {
          Name: req.payload.Name,
          Hostname:req.payload.Hostname,
          Path: req.payload.Path,
          Modified: Date.now(),
        }, (err,doc) => {
          if (err) { reject(err); } else { resolve(doc); }
        },
      );
    })
    .then((doc) => h.response(JSON.stringify(doc)).code(200))
    .catch((err) =>  h.response({error:err}).code(406)),
    options: {
      validate: {
        payload: {
          id: Joi.string().required(),
          Name: Joi.string().min(3),
          Hostname: Joi.string().min(3).required(),
          Port: Joi.number().required(),
          Path: Joi.string(),
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
          if (err) { reject(err); } else { resolve(); }
        },
      );
    }).then(() => h.response().code(200))
      .catch((err) => h.response({error:err}).code(406)),
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
      return new Promise((resolve, reject) => {
        Procedura.remove(
          {},
          (err) => {
            if (err) { reject(err); } else { resolve(); }
          },
        );
      }).then(() => h.response().code(200))
        .catch(() => h.response({error:err}).code(406));
    }
    },
];
