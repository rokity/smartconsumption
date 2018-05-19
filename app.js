const express = require('express')
const app = express()
//Configure Logs
var log = require('pino')()
app.get('/', (req, res) => res.send('Hello World!'))

app.listen(3000, () => log.info('Example app listening on port 3000!'))