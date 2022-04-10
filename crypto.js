const crypto = require('crypto')

const a = crypto.createECDH('secp256k1')
a.generateKeys()

const b = crypto.createECDH('secp256k1')
b.generateKeys()


const a_pub_key_base64 = a.getPublicKey().toString('base64')
const b_pub_key_base64 = b.getPublicKey().toString('base64')

const a_shared_key = a.computeSecret(b_pub_key_base64,'base64','hex')
const b_shared_key = b.computeSecret(a_pub_key_base64,'base64','hex')

console.log(a_shared_key)
console.log(b_shared_key)
