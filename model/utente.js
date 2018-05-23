const mongoose = require('mongoose');

const utenteSchema = new mongoose.Schema({
  username: String,
  password: String,
  CreatedOn: Date,
  Modified: Date,
  Disabled: Boolean,
});

module.exports = mongoose.model('Utente', utenteSchema);
