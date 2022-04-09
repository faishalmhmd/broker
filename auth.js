// import module
const aedes = require('aedes')()
const crypto = require('crypto')
const server = require('net').createServer(aedes.handle)
const mqtt = require('mqtt')

// configuration broker
const port = 1883

server.listen(port, function () {
    console.log(`MQTT Broker running on port: ${port}`)
})

aedes.on('publish', async function (packet, client) {
    if (client) {
        /* 
        this function will publish public key from broker to topic auth
        return: none
         */

        console.log(`[MESSAGE_PUBLISHED] Client ${(client ? client.id : 'BROKER_' + aedes.id)} has published message on ${packet.payload} `)
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
                    const key = crypto.createECDH('secp256k1')
                    key.generateKeys()
                    const pubKey = key.getPublicKey().toString('base64')
                    const payload = {
                        'id' : option.clientId,
                        'key':pubKey
                    }

                    client.on('connect',() => {
                        client.publish(topic,JSON.stringify(payload))
                    })
        }

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
                if(id.includes('publisher')) {
                    console.log('sesuai format')
                    publishPubKey()
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


// var client = mqtt.connect('mqtt://127.0.0.1::1883')
// const topic = 'payload'
// const topicAuth = 'auth'

// client.on('message',(topicAuth,msg) => {
//     msg = msg.toString()
//     console.log(msg)
// })

// client.on('connect',() => {
//     client.subscribe(topicAuth)
// })


