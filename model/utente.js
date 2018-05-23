const mongoose = require('mongoose');

const utenteSchema = new mongoose.Schema({
  Username: String,
  Password: String,
  CreatedOn: Date,
  Modified: Date,
  Disabled: Boolean,
});

module.exports = mongoose.model('Utente', utenteSchema);
