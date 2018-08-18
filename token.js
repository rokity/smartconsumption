var moment = require('moment')
module.exports.tokenGenerator = () => {
    return new Promise((resolve, reject) => {
        require('crypto').randomBytes(48, function (err, buffer) {
            var token = buffer.toString('hex');
            resolve(token);
        })
    })

}

module.exports.expireDateGenerator = () => {
    var data = moment();
    data.add(1, 'h')
    return data;
}

module.exports.isAuthenticated = (params) => {
    //TODO: move token presence under BAD REQUEST response
    var token = global.tokens[params.token];
    if (token == undefined) {
        return false;
    } else {
        var expireDate = token.expireDate;
        var date = moment();
        if (moment(date).isAfter(expireDate))
            return false
        else
            return true;
    }
}