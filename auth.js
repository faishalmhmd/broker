// import module
const aedes = require('aedes')()
const server = require('net').createServer(aedes.handle)
// const mqtt = require('mqtt')

// configuration broker
const port = 1883

server.listen(port, function () {
    console.log(`MQTT Broker running on port: ${port}`)
})

aedes.on('publish', async function (packet, client) {
    if (client) {
        console.log(`[MESSAGE_PUBLISHED] Client ${(client ? client.id : 'BROKER_' + aedes.id)} has published message on ${packet.payload} `)
        let msg = JSON.parse(packet.payload)
        if(msg.hasOwnProperty('id') && msg.hasOwnProperty('key')) {
            console.log('Valid Client')
        }
        // console.log(msg.id)
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


