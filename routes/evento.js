const mongoose = require('mongoose');
const Joi = require('joi');
const Boom = require('boom');
var CronJob = require('cron').CronJob;

var jobs = []

module.exports = [
  {
    method: 'POST',
    path: '/api/evento/insert',
    handler: (req, h) => {
      h.type = 'application/json';
      var Evento = mongoose.model('Evento');
      var tempo = req.payload.Time.split(':');      
      var idProcedura = req.payload.Procedura;
      var job = new CronJob(`0 ${tempo[1]} ${tempo[0]} * * *`, function() {
        var Procedura = mongoose.model('Procedura');
        Procedura.findOne({_id:idProcedura, Disabled: false}).exec(
        (err,procedura)=>
        {
          if(err)   return h.response(err).code(406);
          else      procedura.evoca(procedura);
        }
        )
      }, null, true, null);
      var newEvento = new Evento({
        Time: req.payload.Time,
        Procedura: req.payload.Procedura,
        CreatedOn: Date.now(),
        Modified: Date.now(),
        Disabled: false,
      });
      return newEvento.save()
             .then((doc) => 
              {
                jobs[doc._id] = job;
                return h.response(JSON.stringify(doc)).code(200)
              })
              .catch((err)=>
              {
                return h.response(JSON.stringify({error:err})).code(400)
              });
    },
    options: {
      cors :true,
      validate: {
        payload: {
          Time: Joi.string().min(5).max(5).required(),
          Procedura: Joi.string().required(),
        },
      },
    },
  },
  {
    method: 'POST',
    path: '/api/evento/update',
    handler: (req, h) => new Promise((resolve, reject) => {
      var Evento = mongoose.model('Evento');
      Evento.findOneAndUpdate(
        { _id: req.payload.id, Disabled: false },
        {
          Time: req.payload.Time,
          Procedura: req.payload.Procedura,
          Modified: Date.now(),
        }, (err,doc) => {
          if (err) { reject(err); } 
          else 
          {
            jobs[doc._id].stop()
            var tempo = req.payload.Time.split(':');      
            var idProcedura = req.payload.Procedura;
            jobs[doc._id] = new CronJob(`0 ${tempo[1]} ${tempo[0]} * * *`, function() {
              var Procedura = mongoose.model('Procedura');
              Procedura.findOne({_id:idProcedura, Disabled: false}).exec(
              (err,procedura)=>
              {
                if(err)   return h.response(JSON.stringify({error:err})).code(406);
                else      procedura.evoca(procedura);
              }
              )
            }, null, true, null);
             resolve(); 
          }
        },
      );
    }).then(() => h.response().code(200))
      .catch((err) => h.response(JSON.stringify({error:err})).code(406)),
    options: {
      cors :true,
      validate: {
        payload: {
          id: Joi.string().required(),
          Time: Joi.string().min(5).max(5),
          Procedura: Joi.string(),
        },
      },
    },
  },
  {
    method: 'GET',
    path: '/api/evento/delete/{id}',
    handler: (req, h) => new Promise((resolve, reject) => {
      var Evento = mongoose.model('Evento');
      Evento.findOneAndUpdate(
        { _id: req.params.id },
        {
          Disabled: true,
          Modified: Date.now(),
        }, (err) => {
          if (err) { reject(err); } else { 
            jobs[req.params.id].stop()
            jobs[req.params.id] = null;
            resolve(); }
        },
      );
    }).then(() => h.response().code(200))
      .catch((err) => h.response(JSON.stringify({error:err})).code(406)),
    options: {
      cors :true,
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
    options:{
      cors :true
    }
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
      cors :true,
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
            if (err) { reject(err); } else 
            { 
              for(var key in jobs)
                  jobs[key].stop();
              resolve(); 
            }
          },
        );
      }).then(() => h.response().code(200))
        .catch(() => h.response(JSON.stringify({error:err})).code(406));
    },
    options:{
      cors :true,
    }
  },
];
