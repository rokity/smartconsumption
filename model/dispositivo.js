const mongoose = require('mongoose');

const dispositivoSchema = new mongoose.Schema({
  Name: String,
  Consumo: String,
  Utente:String,
  CreatedOn: Date,
  Modified: Date,
  Disabled: Boolean,
});

module.exports = mongoose.model('Dispositivo', dispositivoSchema);
