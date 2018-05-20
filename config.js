
var options = {
    hostname : 'ds129540.mlab.com',
    port : '29540',
    db : 'smartconsumptions',
    user : 'client',
    pw : 'ciaoo'
}

module.exports = `mongodb://${options.user}:${options.pw}@${options.hostname}:${options.port}/${options.db}`;