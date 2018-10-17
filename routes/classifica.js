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
        return Classifica.find({Giorno:today}).exec();
    },
    options: {
        cors: true
    },    
},
{
    method: 'GET',
    path: '/api/classifica/generate',
    handler:  async (req, h) => {
        h.type = 'application/json';
        var pseudoClassifica = {}
        var Utente = mongoose.model('Utente');
        var Dispositivo = mongoose.model('Dispositivo');
        var Scheduling = mongoose.model('Scheduling');
        return Utente.find({
            Disabled: false
        }).exec().then(async utenti => {
            var today = moment().startOf('day')
            for (var i = 0; i < utenti.length; i++) {
                if (utenti[i] != null) {
                    await Scheduling.find({
                        Disabled: false,
                        Giorno: today,
                        Utente: utenti[i]._id
                    }).exec().then(async scheme => {
                        if (scheme != null && scheme.length > 0) {                           
                            for (var k = 0; k < scheme.length; k++) {
                                if (scheme[k] != null) {                                    
                                    var consumoTotale = 0.01;
                                    if (pseudoClassifica[scheme[k].Utente] == undefined) {
                                        pseudoClassifica[scheme[k].Utente] = new Array(24).fill(0)
                                    }
                                    if (scheme[k].Dispositivi.length > 0 && scheme[k].Dispositivi != null) {
                                        for (var j = 0; j < scheme[k].Dispositivi.length; j++) {
                                            await Dispositivo.find({
                                                Disabled: false,
                                                _id: scheme[k].Dispositivi[j]
                                            }, 'Consumo').exec().then(consumo => {
                                                if (consumo != null)
                                                    {
                                                        consumoTotale = consumoTotale + parseFloat(consumo[0].Consumo)
                                                        
                                                    }
                                            })
                                        }
                                    }
                                    pseudoClassifica[scheme[k].Utente][scheme[k].Time] = (consumoTotale / 1000)
                                    
                                }
                            }

                        }

                    });
                }
            }
            //console.log("ora eseguo lo script")
            var rows = new Array(Object.keys(pseudoClassifica).length)
            var colIndex = 0;
            for (var key in pseudoClassifica) {
                rows[colIndex] = new Array(29);
                rows[colIndex][0] = colIndex+1;
                rows[colIndex][1] = key;
                rows[colIndex][2] = 0;
                for (var i = 0; i < pseudoClassifica[key].length; i++) {
                    if(pseudoClassifica[key][i]==0)
                        pseudoClassifica[key][i]= 0.01;
                    // console.log(pseudoClassifica[key][i])
                    rows[colIndex][3 + i] = pseudoClassifica[key][i]
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
                    for (var i = 0; i < (array.length - 1); i++) {
                        var index = array[i].split(',')[0].split('.')[0]
                        var user_id = rows[index-1][1];
                        var row = array[i].split(',');
                       await Utente.findOne({
                            '_id': user_id
                        }, 'Username', (err, doc) => {
                            row[0] = doc['Username'];
                            array[i] = row.join(',');
                        })                        
                    }
                    array.splice(array.length - 1, 1)
                    var Classifica = mongoose.model('Classifica');
                    var today = moment().format('MM/DD/YYYY');
                    return Classifica.findOneAndUpdate({
                            Giorno: today,
                            Disabled: false
                        }, {
                            Classifica: array,
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
    },
    options: {
        cors: true,
    }
}]