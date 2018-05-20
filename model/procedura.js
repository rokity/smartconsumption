var mongoose = require( 'mongoose' );

var proceduraSchema = new mongoose.Schema({
  Name: String,
  Path : String,
  HttpMethod:String,
  Parameters : Object,
  CreatedOn: Date,
  Modified: Date,
  Disabled: Boolean
});

var Procedura = module.exports = mongoose.model('Procedura', proceduraSchema);