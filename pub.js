const mqtt = require('mqtt')
const option = {
    clientId: 'publisher-1'
}
var client = mqtt.connect('mqtt://127.0.0.1::1883',option)
const topic = 'payload'
const msg = 'helloWorld'
client.on('connect', () => {
        console.log('msg sent')
        client.publish(topic,msg)
})