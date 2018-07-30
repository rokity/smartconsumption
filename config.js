//DB SERVER
// const options = {
//  hostname: 'ds129540.mlab.com',
//  port: '29540',
//  db: 'smartconsumptions',
//  user: 'client',
//  pw: 'ciao',
// };
//DB LOCALE
 const options = {
   hostname: 'localhost',
   port: '27017',
   db: 'test',
   user: 'client',
   pw: 'ciao',
 };
module.exports = `mongodb://${options.user}:${options.pw}@${options.hostname}:${options.port}/${options.db}`;
