const mongoose = require('mongoose');

const proceduraSchema = new mongoose.Schema({
  Name: String,
  Path: String,
  HttpMethod: String,
  Parameters: Object,
  CreatedOn: Date,
  Modified: Date,
  Disabled: Boolean,
});

module.exports = mongoose.model('Procedura', proceduraSchema);
