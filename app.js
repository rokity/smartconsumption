'use strict';

const Hapi = require('hapi');
const await = require('await');
//Configure Logs
var log = require('pino')()

//Get configuration variable for web server
var _hostname = process.argv[2];
var _port = process.argv[3];

const server = Hapi.server({
    port: _port,
    host: _hostname
});
var mongoose = require( 'mongoose' );
server.route({
    method: 'GET',
    path: '/',
    handler: async (request, h) => {
       var Procedura = mongoose.model('Procedura'); 
       var newProcedura = new Procedura({Name:'Test',TipoProcedura:2,CreatedOn:Date.now(),Modified:Date.now(),Disabled:false});
       var prom = newProcedura.save();
       return  prom;
    }
});

//Inizializza il web-server Hapi
const init = async () => {
    //Before connect to the Database
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