// import module
const aedes = require('aedes')()
const server = require('net').createServer(aedes.handle)
const mqtt = require('mqtt')
const mysql = require('mysql')
const crypto = require('crypto')

// konfiguras broker 
const port = 1883

server.listen(port,function () {
    console.log(`MQTT Broker running on port: ${port}`)
})

// API function ketika ada yang publish message
// return: none
aedes.on('publish',async function (packet,clientBroker) {
    if (clientBroker) {

        console.log(`[MESSAGE_PUBLISHED] Client ${(clientBroker ? clientBroker.id : 'BROKER_' + aedes.id)} has published message on ${packet.payload} `)
        let msg = JSON.parse(packet.payload)

        var publishPubKey = () => {
            const option = {
                clientId: 'broker-1'
            }
            var client = mqtt.connect('mqtt://127.0.0.1::1883',option)
            const topic = 'auth'
            var key = crypto.createECDH('secp256k1')
            key.generateKeys()
            var pubKey = key.getPublicKey().toString('base64')
            const symetric_key = key.computeSecret(msg.key,'base64','hex')
            const payload = {
                'id': option.clientId,
                'key': pubKey
            }
            console.log('=============================')
            console.log(`pubKey publihser = ${msg.key}`)
            console.log(`pubKey Broker = ${pubKey}`)
            console.log(`symetric key = ${symetric_key}`)
            console.log('=============================')

            let conn = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: '',
                database: 'db_auth'
            })

            conn.connect(err => {
                if (err) console.log(err)
                let sql = `INSERT INTO t_auth(id,symetric_key) VALUES ('${clientBroker.id}','${symetric_key}')`
                conn.query(sql,(err,res) => {
                    if (err) console.log(err)
                    console.log(`inserted symetric key = ${symetric_key}`)
                })
                let sql2 = `INSERT INTO t_user(id,username,password) VALUES ('${clientBroker.id}','admin','admin')`
                conn.query(sql2,(err,res) => {
                    if (err) console.log(err)
                    console.log(`username ${clientBroker.id} inserted    `)
                })
            })

            client.on('connect',() => {
                client.publish(topic,JSON.stringify(payload))
                client.end()
            })
        }

        // function buat cek payload
        // return: boolean
        var isJson = payload => {
            try {
                JSON.parse(payload)
            }
            catch (e) {
                return false
            }
            return true
        }

        // function buat cek payload JSON && include kata pub/sub
        // return: none
        if (isJson(packet.payload) == true) {
            let id = msg.id
            if (msg.hasOwnProperty('id') && msg.hasOwnProperty('key')) {
                if (id.includes('sub')) {
                    publishPubKey()
                    console.log(`for sub = ${msg.key}`)
                }
                else if (id.includes('pub')) {
                    publishPubKey()
                    console.log(`for pub = ${msg.key}`)
                }

            }
            else {
                console.log('JSON cuman bukan Format yang sesuai')
            }
        }
        else {
            console.log('tidak sesuai format')
        }

    }
})



