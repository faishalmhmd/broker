// import library
const mqtt = require('mqtt')
const crypto = require('crypto')
const fs = require('fs')
const { exec } = require('child_process')
const { stdout } = require('process')
const aes256 = require('aes256')
const si = require('systeminformation')
const os = require('os-utils')



fs.readFile('pubkey.txt','utf-8',(err,data) => {
    if (err) {
        const option = {
            clientId: 'pub-1'
        }

        var client = mqtt.connect('mqtt://127.0.0.1::1883',option)
        const topic = 'auth'

        const key = crypto.createECDH('secp256k1')
        key.generateKeys()

        const pubKey = key.getPublicKey().toString('base64')

        const payload = {
            'id': option.clientId,
            'key': pubKey
        }

        client.on('connect',() => {
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
                try {
                    JSON.parse(payload)
                }
                catch (e) {
                    return false
                }
                return true
            }
            // check if payload value is JSON
            if (isJson(msg) == true) {
                let message = JSON.parse(msg)
                let id = message.id

                if (message.hasOwnProperty('id') && message.hasOwnProperty('key')) {
                    if (id.includes('broker')) {
                        const symetric_key = key.computeSecret(message.key,'base64','hex')
                        console.log('=============================')
                        console.log(`pubkey broker = ${message.key}`)
                        console.log(`pubkey publisher = ${pubKey}`)
                        console.log(`symetric key = ${symetric_key}`)
                        console.log('=============================')


                        fs.writeFile('pubkey.txt',symetric_key,function (err) {
                            if (err) return console.log(err)
                            console.log('symetric key > key.txt')
                        })
                        console.log('connecting to other port')
                        client.end()
                        // re-executing file pub
                        exec('node pub',(error,stdout) => {
                            if (error) {
                                console.log(`error ${error}`)
                                return
                            }
                            console.log(`execute ${stdout}`)

                        })
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

        return
    }
    else {
        // console.log('koneksi ke port 1884')
        const key = data
        const usrnm = aes256.encrypt(key,'admin')
        const psrwd = aes256.encrypt(key,'admin')
        const option = {
            clientId: 'pub-1',
            username: usrnm,
            password: psrwd
        }

        const topic = 'payload'

        var client = mqtt.connect('mqtt://127.0.0.1::1884',option)
        const pesan = 'helloWorld'
        client.on('connect',() => {
            client.subscribe(topic)
            setInterval(() => {
                console.time('aes')
                let payload = aes256.encrypt(key,pesan)
                client.publish('payload',payload)
                console.timeEnd('aes')
            },100)

        })
    }
})


