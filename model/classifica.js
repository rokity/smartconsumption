const mongoose = require('mongoose');

const classificaSchema = new mongoose.Schema({
  Classifica:Array,
  Giorno:Date,
  CreatedOn: Date,
  Modified: Date,
  Disabled: Boolean,
});

module.exports = mongoose.model('Classifica', classificaSchema);
