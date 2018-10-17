//DB SERVER
 const options = {
  hostname: 'ds129540.mlab.com',
  port: '29540',
  db: 'smartconsumptions',
  user: 'client',
  pw: 'ciao',
 };
//DB LOCALE
// const options = {
//   hostname: 'localhost',
//   port: '27017',
//   db: 'test',
//   user: 'client',
//   pw: 'ciao',
// };
module.exports.mongodb = `mongodb://${options.user}:${options.pw}@${options.hostname}:${options.port}/${options.db}`;


module.exports.redis = {
    port:14445,
    host:'redis-14445.c52.us-east-1-4.ec2.cloud.redislabs.com',
    pw:'BdK4U302xeI4n32vgafIKdzmelfBHs5s'
}