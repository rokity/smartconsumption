const mongoose = require('mongoose');
const request = require('request');


const proceduraSchema = new mongoose.Schema({
  Name: String,
  Hostname:String,
  Port:Number,
  Path: String,
  HttpMethod: String,
  Parameters: Object,
  CreatedOn: Date,
  Modified: Date,
  Disabled: Boolean,
});


proceduraSchema.methods.evoca =  async (procedura) => {
  var url = `http://${procedura.Hostname}:${procedura.Port}${procedura.Path}`;
  if(procedura.HttpMethod=="GET")
  {
    request({url:url, qs:procedura.Parameters}, (err, response, body) =>
    {
      if(err) { console.log(err); return; }
      console.log("Get response: " + response.statusCode);
      console.log("body",body)
    });
  }else
  {
    request.post(url,procedura.Parameters,(err, response, body) =>
    {
      if(err) { console.log(err); return; }
      console.log("Get response: " + response.statusCode);
      console.log("body",body)
    }
  );
  }
}



module.exports = mongoose.model('Procedura', proceduraSchema);
