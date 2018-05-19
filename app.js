const express = require('express')
const app = express()
//Configure Logs
var log = require('pino')()

//Configure Swagger-UI Documentation
var swaggerUi = require('swagger-ui-express');
var swaggerDocument = require('./swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.get('/', (req, res) => res.send('Hello World!'))

//Get configuration variable for web server
var hostname = process.argv[2];
var port = process.argv[3];
//Let's start the webserver
app.listen(port, hostname, () => log.info(`Example app listening on ${hostname}:${port}!`))