const mongoose = require('mongoose');
const Joi = require('joi');

module.exports = [
    {
        method: 'POST',
        path: '/api/scheduling/insert',
        handler: (req, h) => {
          h.type = 'application/json';
          var Scheduling = mongoose.model('Scheduling');           
          var newScheduling = new Scheduling({
            Time: req.payload.Time,
            Dispositivi: req.payload.Dispositivi.split(","),
            Utente: req.payload.Utente,
            Giorno: req.payload.Giorno,
            CreatedOn: Date.now(),
            Modified: Date.now(),
            Disabled: false,
          });
          return newScheduling.save()
                 .then((doc) => 
                  {
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
              Time: Joi.string().required(),
              Dispositivi: Joi.string().required(),
              Utente: Joi.string().required(),
              Giorno: Joi.string().required()
            },
          },
        },
      },
      {
        method: 'POST',
        path: '/api/scheduling/update',
        handler: (req, h) => {
          h.type = 'application/json';
          var Scheduling = mongoose.model('Scheduling');    
          return new Promise((resolve,reject) =>
            {
                Scheduling.findOneAndUpdate(
                    { _id: req.payload.id, Disabled: false },{
                    Time: req.payload.Time,
                    Dispositivi: req.payload.Dsipositivi,
                    Utente: req.payload.Utente,
                    Giorno: req.payload.Giorno,
                    CreatedOn: Date.now(),
                    Modified: Date.now(),
                    Disabled: false,
                  },
                  (err,doc)=>
                    {
                        if(err) reject(err);
                        else resolve();
                    });
            }).then(() => h.response().code(200))
            .catch((err) => h.response(JSON.stringify({error:err})).code(406))
        },
        options: {
          cors :true,
          validate: {
            payload: {
              id:Joi.string().required(),
              Time: Joi.string().required(),
              Dispositivi: Joi.array().required(),
              Utente: Joi.string().required(),
              Giorno: Joi.string().required()
            },
          },
        },
      },
]