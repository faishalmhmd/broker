const mqtt = require('mqtt')
var client = mqtt.connect('mqtt://127.0.0.1::1883')
const topic = 'auth'

client.on('message',(topic,msg) => {
    // msg = msg.toString()
    console.log(msg)
})

client.on('connect',() => {
    client.subscribe(topic)
})