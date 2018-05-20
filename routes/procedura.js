
var mongoose = require('mongoose');
var Joi = require('joi');
module.exports = [
    { 
        method: 'GET',
        path: '/api/procedura/insert/{name}/{TipoProcedura}',
        handler: (request,h) => 
        {     
            var Procedura = mongoose.model('Procedura');        
            var newProcedura = new Procedura({Name:request.params.name,TipoProcedura:request.params.TipoProcedura,CreatedOn:Date.now(),Modified:Date.now(),Disabled:false});
            var prom = newProcedura.save();
            return  prom;
        },
        options: {
            validate: {
                params: {
                    name: Joi.string().min(3),
                    TipoProcedura: Joi.number()
                }
            }
        }
    },
];
