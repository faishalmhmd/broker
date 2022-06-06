    // import module
const aedes = require('aedes')()
const server = require('net').createServer(aedes.handle)
const mqtt = require('mqtt')
const mysql = require('mysql')            
const crypto = require('crypto')

// configuration broker
const port = 1883

server.listen(port, function () {
    console.log(`MQTT Broker running on port: ${port}`)
})


aedes.on('publish', async function (packet, clientBroker) {
    if (clientBroker) {
        /* 
        this function will publish public key from broker to topic auth
        return: none
         */

        console.log(`[MESSAGE_PUBLISHED] Client ${(clientBroker ? clientBroker.id : 'BROKER_' + aedes.id)} has published message on ${packet.payload} `)
        let msg = JSON.parse(packet.payload)
        
        /* 
        this function will return a boolean statement if payload can parsing to JSON then will return true
        return:  boolean
        */
        
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
                    'id' :option.clientId,
                    'key':pubKey
                }
                console.log('=============================')
                console.log(`pubKey publihser = ${msg.key}`)
                console.log(`pubKey Broker = ${pubKey}`)
                console.log(`symetric key = ${symetric_key}`)
                console.log('=============================')
                // mysql connection
                let conn = mysql.createConnection({
                    host: 'localhost',
                    user: 'root',
                    password: '',
                    database: 'db_auth'
                })  

                conn.connect(err => {
                    if(err) console.log(err)
                    let sql = `INSERT INTO t_auth(id,symetric_key) VALUES ('${clientBroker.id}','${symetric_key}')`
                    conn.query(sql,(err,res) => {
                        if(err) console.log(err)
                        console.log(`inserted symetric key = ${symetric_key}`)
                    })
                    // console.log(clientBroker.id)
                })

            client.on('connect',() => {
                    client.publish(topic,JSON.stringify(payload))
                    client.end()
            })
        }
        
      

         /* 
        this function will check payload or message from broker if json
        return: none        
        */
        var isJson = payload => {
            try{
                JSON.parse(payload)
            }
            catch(e){
                return false
            }
            return true
        }
        
        // check if payload value is JSON
        if(isJson(packet.payload) == true) {
            let id = msg.id
            if(msg.hasOwnProperty('id') && msg.hasOwnProperty('key')) {
                if(id.includes('sub')) {
                    publishPubKey()
                    console.log(`for sub = ${msg.key}`)
                }
                else if(id.includes('pub')) {
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



