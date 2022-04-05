const crypto = require('crypto')

const a = crypto.createECDH('secp256k1')
a.generateKeys()


const a_pub_key_base64 = a.getPublicKey().toString('base64')

console.log(a_pub_key_base64)

const a_shared_key = a.computeSecret(b_pub_key_base64,'base64','hex')

console.log(a_shared_key)