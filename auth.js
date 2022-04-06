// import module
const aedes = require('aedes')()
const server = require('net').createServer(aedes.handle)
const mqtt = require('mqtt')
const crypto = require('crypto')

// configuration broker
const port = 1883

server.listen(port, function () {
    console.log(`MQTT Broker running on port: ${port}`)
})

aedes.on('publish', async function (packet, client) {
    if (client) {
        console.log(`[MESSAGE_PUBLISHED] Client ${(client ? client.id : 'BROKER_' + aedes.id)} has published message on ${packet.payload} `)
        let msg = JSON.parse(packet.payload)
        
        let isJson = payload => {
            try{
                JSON.parse(payload)
            }
            catch(e){
                return false
            }
            return true
        }
        isJson(packet.payload)

        if(isJson(packet.payload) == true) {
            let id = msg.id
            
            if(msg.hasOwnProperty('id') && msg.hasOwnProperty('key')) {
                if(id.includes('publisher')) {
                    console.log('sesuai format')
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


