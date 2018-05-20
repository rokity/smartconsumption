
var mongoose = require('mongoose');

module.exports = [
    { 
        method: 'GET',
        path: '/',
        handler: (request,h) => 
        {     
            var Procedura = mongoose.model('Procedura');        
            var newProcedura = new Procedura({Name:'Test',TipoProcedura:2,CreatedOn:Date.now(),Modified:Date.now(),Disabled:false});
            var prom = newProcedura.save();
            return  prom;
        } },
];
