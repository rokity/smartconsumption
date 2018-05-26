const mongoose = require('mongoose');
const Joi = require('joi');

module.exports = [
    {
        method: 'POST',
        path: '/api/utente/insert',
        handler: (req, h) => 
        {
            h.type = 'application/json';
            var Utente = mongoose.model('Utente');
            var newUtente = new Utente({
                Username: req.payload.Username,
                Password: req.payload.Password,
                CreatedOn: Date.now(),
                Modified: Date.now(),
                Disabled: false,
            });
            return newUtente.save()
            .then((doc) => {return h.response(JSON.stringify(doc)).code(200)})
            .catch((err)=>{ return h.response(JSON.stringify({error:err})).code(400)});
        },
        options:{
            cors :true,
            validate: {
                payload: {
                  Username: Joi.string().min(5).required(),
                  Password: Joi.string().min(5).required(),
                },
              },
        }
      },
      {
        method: 'GET',
        path: '/api/utente/getusernamebyid/{id}',
        handler: (req, h) => 
        {
            h.type = 'application/json';
            var Utente = mongoose.model('Utente');
            return Utente.find({ _id: req.params.id, Disabled: false },'Username').exec();
        },
        options:{
            cors :true,
            validate: {
                params: {
                  id: Joi.string().required(),
                },
              },
        }
      },
      {
        method: 'GET',
        path: '/api/utente/login/{Username}/{Password}',
        handler: (req, h) => 
        {
            h.type = 'application/json';
            var Utente = mongoose.model('Utente');
            return Utente.findOne({ Username: req.params.Username,Password:req.params.Password, Disabled: false }).exec();
        },
        options:{
            cors :true,
            validate: {
                params: {
                    Username: Joi.string().min(5).required(),
                    Password: Joi.string().min(5).required(),
                },
              },
        }
      },
      
]