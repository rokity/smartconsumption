//require mongoose module
var mongoose = require('mongoose');

//require database URL from properties file
var dbURL = require('./config');

/**
 * connection to database
 * @param {Object} log - Pino object of logger
 */
module.exports =function(log){

    mongoose.connect(dbURL);

    mongoose.connection.on('connected', function(){
        log.info("Mongoose default connection is open ");
        require('./model')();
    });

    mongoose.connection.on('error', function(err){
        log.error("Mongoose default connection has occured "+err+" error");
    });

    mongoose.connection.on('disconnected', function(){
        log.error("Mongoose default connection is disconnected");
    });

    process.on('SIGINT', function(){
        mongoose.connection.close(function(){
            log.error("Mongoose default connection is disconnected due to application termination");
            process.exit(0)
        });
    });
}