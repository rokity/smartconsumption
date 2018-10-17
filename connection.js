// require mongoose module
const mongoose = require('mongoose');
const model = require('./model');
// require database URL from properties file
const config = require('./config');

/**
 * connection to database
 */
module.exports = () => {
  mongoose.connect(config.mongodb, {
    useNewUrlParser: true
  });

  mongoose.connection.on('connected', () => {
    console.log('Mongoose default connection is open ');
    return model();
  });

  mongoose.connection.on('error', (err) => {
    console.error(`Mongoose default connection has occured ${err} error`);
  });

  mongoose.connection.on('disconnected', () => {
    console.error('Mongoose default connection is disconnected');
  });

  mongoose.connection.once('open', function () {
    //Connesso
    logService();
  });

  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      console.error('Mongoose default connection is disconnected due to application termination');
      process.exit(0);
    });
  });
};


/**
 * REDIS CONNECTION
 */
var redis = require("redis");
global.clientRedis = redis.createClient({port:config.redis.port,host:config.redis.host});
global.clientRedis.auth(config.redis.pw);
global.clientRedis.on("error", function (err) {
  console.log("Error " + err);
});


//Override console log
var logService = () => {
  var mongoose = require('mongoose');
  var Log = mongoose.model('Log');
  var originalConsole = console;
  console = {}
  console.log = function()  {
    var newLog = new Log({
      Tipo: "log",
      Value: arguments,
      CreatedOn: Date.now(),
    });
    return newLog.save();
  }
  console.info = function(){
    var newLog = new Log({
      Tipo: "info",
      Value: arguments,
      CreatedOn: Date.now(),
    });
    return newLog.save();
  }
  console.warn = function() {
    var newLog = new Log({
      Tipo: "warn",
      Value: arguments,
      CreatedOn: Date.now(),
    });
    return newLog.save();
  }
  console.error = function() {
    var newLog = new Log({
      Tipo: "info",
      Value: arguments,
      CreatedOn: Date.now(),
    });
    return newLog.save();
  }

}