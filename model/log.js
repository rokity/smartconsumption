const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  Tipo:String,
  Value:Object,
  CreatedOn: Date,
});

module.exports = mongoose.model('Log', logSchema);
