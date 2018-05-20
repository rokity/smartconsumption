var mongoose = require( 'mongoose' );

var proceduraSchema = new mongoose.Schema({
  Name: String,
  TipoProcedura: Number,
  CreatedOn: Date,
  Modified: Date,
  Disabled: Boolean
});

var Procedura = module.exports = mongoose.model('Procedura', proceduraSchema);