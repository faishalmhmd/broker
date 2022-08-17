// import library
const mqtt = require("mqtt")
const crypto = require("crypto")
const fs = require("fs")
const { exec } = require("child_process")
const { stdout } = require("process")
const aes256 = require("aes256")
const Websocket = require('ws')
const serverWs = 'ws://127.0.0.1:4000'
// const ws = new Websocket(serverWs)

fs.readFile("subkey.txt","utf-8",(err,data) => {
  // if subscriber doesnt have a symetric key
  if (err) {
    const option = {
      clientId: "sub-1",
    }

    var client = mqtt.connect("mqtt://127.0.0.1::1883",option)
    const topic = "auth"

    const key = crypto.createECDH("secp256k1")
    key.generateKeys()

    const pubKey = key.getPublicKey().toString("base64")

    const payload = {
      id: option.clientId,
      key: pubKey,
    }

    client.on("connect",() => {
      client.subscribe(topic)
      client.publish(topic,JSON.stringify(payload))
    })

    client.on("message",(topic,msg) => {
      msg = msg.toString()
      console.log(msg)

      /* 
        this function will check payload or message from broker if json
        return: none        
        */
      var isJson = (payload) => {
        try {
          JSON.parse(payload)
        } catch (e) {
          return false
        }
        return true
      }
      // check if payload value is JSON
      if (isJson(msg) == true) {
        let message = JSON.parse(msg)
        let id = message.id

        if (message.hasOwnProperty("id") && message.hasOwnProperty("key")) {
          if (id.includes("broker")) {
            const symetric_key = key.computeSecret(message.key,"base64","hex")
            console.log("=============================")
            console.log(`pubkey broker = ${message.key}`)
            console.log(`pubkey publisher = ${pubKey}`)
            console.log(`symetric key = ${symetric_key}`)
            console.log("=============================")

            fs.writeFile("subkey.txt",symetric_key,function (err) {
              if (err) return console.log(err)
              console.log("symetric key > subkey.txt")
            })
            console.log("connecting to other port")
            client.end()
            // re-executing file sub
            exec("node sub",(error,stdout) => {
              if (error) {
                console.log(`error ${error}`)
                return
              }
              console.log(`execute ${stdout}`)
            })
          }
        } else {
          console.log("JSON cuman bukan Format yang sesuai")
        }
      } else {
        console.log("tidak sesuai format")
      }
    })

    return
  }
  // else if subscriber has a symetric key
  else {
    console.log("koneksi ke port 1884")
    const key = data
    const usrnm = aes256.encrypt(key,"admin")
    const psrwd = aes256.encrypt(key,"admin")
    const option = {
      clientId: "sub-1",
      username: usrnm,
      password: psrwd,
    }

    const topic = "sub-1"

    var client = mqtt.connect("mqtt://127.0.0.1::1884",option)

    client.on("connect",() => {
      client.subscribe(topic)
    })

    client.on("message",(topic,message) => {
      let decryptmsg = aes256.decrypt(key,Buffer.from(message,"base64").toString())
//       ws.send(decryptmsg)
      console.log(`original message = ${message} decrypt message = ${decryptmsg}`)
    })
  }
})
