// import library
const mqtt = require('mqtt')
const crypto = require('crypto')

// connection options
const option = {
    clientId: 'publisher-1'
}
var client = mqtt.connect('mqtt://127.0.0.1::1883',option)
const topic = 'auth'

const key = crypto.createECDH('secp256k1')
key.generateKeys()

const pubKey = key.getPublicKey().toString('base64')

const payload = {
    'id' : option.clientId,
    'key' : pubKey
}

const maliciousPayload = {
    'asdasdasd' : option.clientId,
    'asdasdasd' : pubKey
}
console.log(payload)
client.on('connect', () => {
            client.publish(topic,JSON.stringify(maliciousPayload))
            // client.publish(topic,'helloWorld')
            console.log('msg sent')
    })

