'use strict';

const Hapi = require('hapi');
var mongoose = require( 'mongoose' );
const await = require('await');
var log = require('pino')()

//Get configuration variable for web-server
var _hostname = process.argv[2];
var _port = process.argv[3];
//Setup configuration variables for web-server
const server = Hapi.server({
    port: _port,
    host: _hostname
});

//Get Routes
var routes = require('./routes');
server.route(routes);

//Inizializza il web-server Hapi
const init = async () => {
    //Connect to the Database and load Models
    require('./connection')(log);
    //Add Plugin of Hapi 
    await server.register([require('vision'),require('inert'),require('lout')]);
    //Let's start the webserver
    await server.start();
    log.info(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
    log.error(err);
    process.exit(1);
});

init();