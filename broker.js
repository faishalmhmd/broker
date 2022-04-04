// module broker
const aedes = require('aedes')()
const server = require('net').createServer(aedes.handle)
const port = 1883

server.listen(port, function () {
    console.log(`MQTT Broker running on port: ${port}`)
})

aedes.on('publish', async function (packet, client) {
    if (client) {
        console.log(`[MESSAGE_PUBLISHED] Client ${(client ? client.id : 'BROKER_' + aedes.id)} has published message on ${packet.payload} `)
    }
})

// forwarder
const mqtt = require('mqtt')
var client = mqtt.connect('mqtt://127.0.0.1::1883')
const topic = 'payload'
const topicAuth = 'auth'

client.on('message',(topic,msg) => {
    msg = msg.toString()
    client.publish(topicAuth,msg)
})

client.on('connect',() => {
    client.subscribe(topic)
})