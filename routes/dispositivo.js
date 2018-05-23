const mongoose = require('mongoose');
const Joi = require('joi');


module.exports = [
    {
        method: 'POST',
        path: '/api/dispositivo/insert',
        handler: (req, h) => 
        {
            h.type = 'application/json';
            var utente = "";
            if(req.payload.Utente!=null)
                utente = req.payload.Utente
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
            .then((doc) => {return h.response(JSON.stringify(doc)).code(200)})
            .catch((err)=>{ return h.response(JSON.stringify({error:err})).code(400)});
        },
        options:{
            cors :true,
            validate: {
                payload: {
                    Name: Joi.string().required(),
                    Consumo: Joi.string().required(),
                    Utente: Joi.string(),
                },
              },
        }
      },
      {
        method: 'POST',
        path: '/api/dispositivo/update',
        handler: (req, h) => 
        {
            return new Promise((resolve, reject)=>
            {
                h.type = 'application/json';
            var utente = "";
            if(req.payload.Utente!=null)
                utente = req.payload.Utente
            var Dispositivo = mongoose.model('Dispositivo');
            Dispositivo.findOneAndUpdate(
                { _id: req.payload.id, Disabled: false },
                {
                    Name: req.payload.Name,
                    Consumo: req.payload.Consumo,
                    Utente: utente,
                    Modified: Date.now(),
                }, (err, doc) => {
                    
                    if(err)   return h.response(JSON.stringify({error:err})).code(406);
                    else resolve();
                },
            );
            })
            .then(() => h.response().code(200))  
            .catch((err) => h.response(JSON.stringify({error:err})).code(406))         
        },
        options:{
            cors :true,
            validate: {
                payload: {
                    id:Joi.strict().required(),
                    Name: Joi.string().required(),
                    Consumo: Joi.string().required(),
                    Utente: Joi.string(),
                },
              },
        }
      },
      {
        method: 'GET',
        path: '/api/dispositivo/delete/{id}',
        handler: (req, h) => new Promise((resolve, reject) => {
          var Dispositivo = mongoose.model('Dispositivo');
          Dispositivo.findOneAndUpdate(
            { _id: req.params.id },
            {
              Disabled: true,
              Modified: Date.now(),
            }, (err) => {
              if (err)  
                reject(err);  
              else      
                resolve(); 
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
        path: '/api/dispositivo/getall',
        handler: (req, h) => {
          h.type = 'application/json';
          const Dispositivo = mongoose.model('Dispositivo');
          return Dispositivo.find({ Disabled: false }).exec();
        },
        options:{
          cors :true
        }
      },
      {
        method: 'GET',
        path: '/api/dispositivo/getbyid/{id}',
        handler: (req, h) => {
          h.type = 'application/json';
          const Dispositivo = mongoose.model('Dispositivo');
          return Dispositivo.find({ _id: req.params.id, Disabled: false }).exec();
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
        path: '/api/dispositivo/getdispositivibyutente/{id}',
        handler: (req, h) => {
          h.type = 'application/json';
          const Dispositivo = mongoose.model('Dispositivo');
          return Dispositivo.find({ Utente: req.params.id, Disabled: false }).exec();
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
];