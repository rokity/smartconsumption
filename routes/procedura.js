
var mongoose = require('mongoose');
var Joi = require('joi');
module.exports = [
    { 
        method: 'GET',
        path: '/api/procedura/insert/{name}/{TipoProcedura}',
        handler: (request,h) => 
        {     
            var Procedura = mongoose.model('Procedura');        
            var newProcedura = new Procedura({
             Name:request.params.name,
             TipoProcedura:request.params.TipoProcedura,
             CreatedOn:Date.now(),
             Modified:Date.now(),
             Disabled:false});
            return  newProcedura.save();
        },
        options: {
            validate: {
                params: {
                    name: Joi.string().min(3).required(),
                    TipoProcedura: Joi.number().required()
                }
            }
        }
    },
];
