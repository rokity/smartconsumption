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

server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {

        return 'Hello, world!';
    }
});

//Inizializza il web-server Hapi
const init = async () => {
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