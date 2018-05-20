var mongoose = require( 'mongoose' );

var eventoSchema = new mongoose.Schema({
  Time: String,
  TimeZone : String,
  Procedura: String,
  CreatedOn: Date,
  Modified: Date,
  Disabled: Boolean
});

var Evento = module.exports = mongoose.model('Evento', eventoSchema);