const mongoose = require('mongoose');

const schedulingSchema = new mongoose.Schema({
  Time: String,
  Dispositivi: Array,
  Utente:String,
  Giorno:Date,
  CreatedOn: Date,
  Modified: Date,
  Disabled: Boolean,
});

module.exports = mongoose.model('Scheduling', schedulingSchema);
