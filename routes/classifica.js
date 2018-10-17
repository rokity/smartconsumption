const mongoose = require('mongoose');
const moment = require('moment')


module.exports = [{
    method: 'GET',
    path: '/api/classifica/get',
    handler: (req, h) => {
        h.type = 'application/json';
        var Classifica = mongoose.model('Classifica');
        var today = moment().format('MM/DD/YYYY');
        return Classifica.find({Giorno:today}).exec();
    },
    options: {
        cors: true
    },
}]