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

// const maliciousPayload = {
//     'asdasdasd' : option.clientId,
//     'asdasdasd' : pubKey
// }
    
    client.on('connect', () => {
            client.subscribe(topic)
            client.publish(topic,JSON.stringify(payload))
    })

    client.on('message',(topic,msg) => {
        msg = msg.toString()
        console.log(msg)
        
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
        if(isJson(msg) == true) {
            let message = JSON.parse(msg)
            let id = message.id
            if(message.hasOwnProperty('id') && message.hasOwnProperty('key')) {
                if(id.includes('broker')) {
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
        
    })
    
