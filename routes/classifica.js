const mongoose = require('mongoose');
const moment = require('moment')
var fs = require('fs');
const exec = require('child_process').exec;


module.exports = [{
        method: 'GET',
        path: '/api/classifica/get',
        handler: (req, h) => {
            h.type = 'application/json';
            var Classifica = mongoose.model('Classifica');
            var today = moment().format('MM/DD/YYYY');
            
            return Classifica.find({
                Giorno: today
            }).exec();
        },
        options: {
            cors: true
        },
    },
    {
        method: 'GET',
        path: '/api/classifica/generate',
        handler: async (req, h) => {
                h.type = 'application/json';
                var pseudoClassifica = {}
                var Classifica = mongoose.model('Classifica');
                var Utente = mongoose.model('Utente');
                var Dispositivo = mongoose.model('Dispositivo');
                var Scheduling = mongoose.model('Scheduling');
                // return Utente.find({
                //     Disabled: false
                // }).exec().then(async utenti => {
                var today = moment().startOf('day')
                // for (var i = 0; i < utenti.length; i++) {
                // if (utenti[i] != null) {
                return Scheduling.find({
                    Disabled: false,
                    Giorno: today,
                }).exec().then(async schemi => {
                    if (schemi != null && schemi.length > 0) {
                        for (var k = 0; k < schemi.length; k++) {
                            if (schemi[k] != null) {
                                var consumoTotale = 0.01;
                                if (pseudoClassifica[schemi[k].Utente] == undefined) {
                                    pseudoClassifica[schemi[k].Utente] = new Array(24).fill(0)
                                }
                                if (schemi[k].Dispositivi.length > 0 && schemi[k].Dispositivi != null) {
                                    for (var j = 0; j < schemi[k].Dispositivi.length; j++) {
                                        await Dispositivo.find({
                                            Disabled: false,
                                            _id: schemi[k].Dispositivi[j]
                                        }, 'Consumo').exec().then(consumo => {
                                            if (consumo != null) {
                                                consumoTotale = consumoTotale + parseFloat(consumo[0].Consumo)

                                            }
                                        })
                                    }
                                }
                                pseudoClassifica[schemi[k].Utente][schemi[k].Time] = (consumoTotale / 1000)

                            }
                        }




                        // }
                        // }
                        //console.log("ora eseguo lo script")
                        var rows = new Array(Object.keys(pseudoClassifica).length)
                        var colIndex = 0;
                        for (var user_id in pseudoClassifica) {
                            rows[colIndex] = new Array(29);

                            rows[colIndex][0] = colIndex + 1;
                            rows[colIndex][1] = user_id;
                            rows[colIndex][2] = 0;
                            for (var i = 0; i < pseudoClassifica[user_id].length; i++) {
                                if (pseudoClassifica[user_id][i] == 0)
                                    pseudoClassifica[user_id][i] = 0.01;
                                // console.log(pseudoClassifica[key][i])
                                rows[colIndex][3 + i] = pseudoClassifica[user_id][i]
                            }
                            rows[colIndex][27] = 0;
                            rows[colIndex][28] = 0;
                            colIndex++;
                        }

                        return new Promise(resolve => {
                            fs.writeFile("input_consumption.csv", "", (err) => {
                                for (var i = 0; i < rows.length; i++) {
                                    if ((i + 1) != rows.length)
                                        fs.appendFileSync("input_consumption.csv", rows[i].toString() + "\r\n");
                                    else
                                        fs.appendFileSync("input_consumption.csv", rows[i].toString());
                                }
                                resolve()
                            })
                        }).then(() => {
                            return new Promise(resolve => {
                                exec('python Core_Thread_RVSample_solo_house_toApp.py',
                                    (error, stdout, stderr) => {
                                        console.log(`${stdout}`);
                                        console.error(`${stderr}`);
                                        if (error !== null) {
                                            console.error(`exec error: ${error}`);
                                        }
                                        resolve()
                                    });
                            }).then(async () => {
                                var result = fs.readFileSync('output_script.csv')
                                var array = result.toString().split('\n')
                                var results = array.map(async (val, i, arr) => {
                                    if (arr[i].length > 0) {
                                        var index = val.split(',')[0].split('.')[0]
                                        var user_id = rows[index - 1][1];
                                        var row = val.split(',');
                                        await Utente.findOne({
                                            '_id': user_id
                                        }, 'Username').exec().then(doc =>
                                            {                                                
                                                row[0] = doc['Username'];
                                                val = row.join(',');
                                            })                                   
                                        return val;
                                    }
                                    else
                                        return null;

                                })
                                
                                return Promise.all(results).then(classificaFinale => {
                                   
                                    
                                    classificaFinale.splice(classificaFinale.length - 1, 1)                                    

                                    var today = moment().format('MM/DD/YYYY');
                                   
                                    return Classifica.findOneAndUpdate({
                                            Giorno: today,
                                            Disabled: false
                                        }, {
                                            Classifica: classificaFinale,
                                            Giorno: today,
                                            CreatedOn: Date.now(),
                                            Modified: Date.now(),
                                            Disabled: false,
                                        }, {
                                            upsert: true
                                        }).then((doc) => {
                                            return h.response().code(200)
                                        })
                                        .catch(err => {
                                            return h.response(JSON.stringify({
                                                error: err
                                            })).code(400)
                                        })
                                })

                            })
                        })
                    }
                });
                // })
            },
            options: {
                cors: true,
            }
    }
]