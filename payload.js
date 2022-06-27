// import module
"use strict"
const aedes = require("aedes")()
const server = require("net").createServer(aedes.handle)
const mysql = require("mysql")
const aes256 = require("aes256")
const mqtt = require("mqtt")
const { rejects } = require("assert")
const { resolve } = require("path")
const fs = require("fs")
const crypto = require("crypto")
const clc = require('cli-color')



// configuration broker
const port = 1884

var conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1",
  database: "db_auth",
})

var list_data

conn.connect((err) => {
  if (err) console.log(err)
})

server.listen(port,() => {
  console.log(`MQTT Broker running on port: ${port}`)
})

conn.query(`SELECT * FROM t_auth WHERE id like '%sub%'`,(err,res) => {
  if (err) console.log(err)
  fs.writeFile("subscriber.json",JSON.stringify(res),(err) => {
    if (err) return console.log(err)
    readSubscriber()
  })
})

var readSubscriber = () => {
  fs.readFile("subscriber.json",(err,data) => {
    if (err) throw err
    list_data = JSON.parse(data)
    console.log(clc.magenta("List Subscriber ->",list_data.length))
  })
}

aedes.authenticate = (client,username,password,callback) => {
  password = Buffer.from(password,"base64").toString()

  if (client.id == "forwarder") {
    return callback(null,true)
  }

  conn.query(
    `select * from t_auth where id='${client.id}'`,
    (err,res,fields) => {
      if (err) console.log(err)
      var key = res[0].symetric_key

      let usrnm = aes256.decrypt(key,username)
      let psrwd = aes256.decrypt(key,password)
      if (usrnm === "admin" && psrwd === "admin") {
        return callback(null,true)
      }
      const error = new Error(
        "Authentication Failed!! Invalid user credentials."
      )
      console.log("Error ! Authentication failed.")
      return callback(error,false)
    }
  )
}

aedes.on("client",(client) => {
  console.log(clc.blue(`[CLIENT_CONNECTED] Client ${client.id}`))
})

aedes.on("clientDisconnect",(client) => {
  console.log(clc.red(`[CLIENT_DISCONNECTED] Client  ${client.id}`))
})

aedes.on("publish",async (packet,client) => {
  //   console.log(packet)
  // console.log(Buffer.from(packet.payload, "base64").toString())
  // console.log(packet)

  if (packet.topic == "payload") {
    // console.log(Buffer.from(packet.payload,"base64").toString())
    const option = {
      clientId: "forwarder",
      username: "admin",
      password: "admin",
    }
    var client = mqtt.connect("mqtt:127.0.0.1:1884",option)
    client.on("connect",() => {
      conn.query(`SELECT * FROM t_auth WHERE id='pub-1'`,(err,res) => {
        if (err) console.log(err)
        let sql = `INSERT INTO t_encrypt VALUES ('pub-1','${packet.payload}')`
        conn.query(sql,function (err,result) {
          if (err) throw err
          console.log(clc.yellow(`Payload = ${packet.payload}`))
        })
        // console.log(res[0].symetric_key)
        let key = res[0].symetric_key
        let payload = aes256.decrypt(
          key,
          Buffer.from(packet.payload,"base64").toString()
        )
        console.log(`Decrpyted = ${payload}`)
        list_data.forEach((element) => {
          console.log(`Forward -> ${element.id}`)
          client.publish(
            `${element.id}`,
            aes256.encrypt(element.symetric_key,payload)
          )
        })
        client.end()
      })
    })
  }
})
