const express = require('express')
const app = express()
//Configure Logs
var log = require('pino')()
app.get('/', (req, res) => res.send('Hello World!'))

var hostname = process.argv[2];
var port = process.argv[3];
app.listen(port,hostname, () => log.error(`Example app listening on ${hostname}:${port}!`))