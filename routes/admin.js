var fs = require('fs');
var path = require('path');
module.exports = [{
        method: 'GET',
        path: '/admin',
        handler: (req, h) => {
            let reqPath = path.join(__dirname, '../');
            return h.file(reqPath + 'admin-static/index.html');
        },
        options: {
            cors: true
        },
    },
    {
        method: 'GET',
        path: '/js/{name}',
        handler: (req, h) => {
            let reqPath = path.join(__dirname, '../');
            return h.file(reqPath + 'admin-static/js/'+req.params.name);
        },
        options: {
            cors: true
        },
    },
    {
        method: 'GET',
        path: '/node_modules/{name*}',
        handler: (req, h) => {
            
            let reqPath = path.join(__dirname, '../');
            return h.file(reqPath + 'node_modules/'+req.params.name);
        },
        options: {
            cors: true
        },
    },
];