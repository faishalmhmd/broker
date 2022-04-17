const crypto = require('crypto')

const aes256 = require('aes256')

const message = 'asdasdas'

const encrypted = aes256.encrypt('36e16c1499d613a91a2089c63741ba8b8586c29d8bea64b635fed4f667d277a1',message)
console.log(`message encrypted = ${encrypted}`)

const decrypted = aes256.decrypt('36e16c1499d613a91a2089c63741ba8b8586c29d8bea64b635fed4f667d277a1',encrypted)
console.log(`message decrypted = ${decrypted}`)
