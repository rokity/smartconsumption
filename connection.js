// require mongoose module
const mongoose = require('mongoose');
const model = require('./model');
// require database URL from properties file
const dbURL = require('./config');

/**
 * connection to database
 * @param {Object} log - Pino object of logger
 */
module.exports = (log) => {
  mongoose.connect(dbURL);

  mongoose.connection.on('connected', () => {
    log.info('Mongoose default connection is open ');
    return model();
  });

  mongoose.connection.on('error', (err) => {
    log.error(`Mongoose default connection has occured ${err} error`);
  });

  mongoose.connection.on('disconnected', () => {
    log.error('Mongoose default connection is disconnected');
  });

  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      log.error('Mongoose default connection is disconnected due to application termination');
      process.exit(0);
    });
  });
};
