const mongoose = require('mongoose');
const request = require('request');
const queryString = require('query-string');


const proceduraSchema = new mongoose.Schema({
  Name: String,
  Hostname:String,
  Port:Number,
  Path: String,
  CreatedOn: Date,
  Modified: Date,
  Disabled: Boolean,
});


proceduraSchema.methods.evoca =  async (procedura) => {
  var url = `http://${procedura.Hostname}:${procedura.Port}${procedura.Path}`;
    request({url:url}, (err, response, body) =>
    {
      if(err) { console.log(err); return; }
      console.log("Get response: " + response.statusCode);
      console.log("body",body)
    });
}



module.exports = mongoose.model('Procedura', proceduraSchema);
