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

module.exports.isAuthenticated = (token) => {
    return new Promise((resolve, reject) => {
        global.clientRedis.get(token, (err, reply) => {
            reply = JSON.parse(reply)
            if (reply == undefined) {
                resolve(false)
            } else {
                var expireDate = moment(new Date(reply.expireDate));
                var date = moment();
                if (moment(date).isAfter(expireDate)) {
                    resolve(false)
                } else {
                    resolve(reply)
                }

            }
        })
    })

}
