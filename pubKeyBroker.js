const crypto = require('crypto')


let generateKeyBroker = () => {
    const key_broker = crypto.createECDH('secp256k1')

    key_broker.generateKeys()

    const pub_key_broker = key_broker.getPublicKey().toString('base64')

    return pub_key_broker
}

const pub_key_broker = generateKeyBroker()

console.log(pub_key_broker)

export default generateKeyBroker