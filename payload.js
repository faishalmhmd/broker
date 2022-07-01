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
const http = require('http')


// konfigutasi broker
const port = 1884

var conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1",
  database: "db_auth",
})

var list_data

// API function buat koneksiin ke db
// return: none
conn.connect((err) => {
  if (err) console.log(err)
})

// API function broker buat jalanin port
// return: none 
server.listen(port,() => {
  console.log(`MQTT Broker running on port: ${port}`)
})

// query buat ngambil data dari db
// return: none
conn.query(`SELECT * FROM t_auth WHERE id like '%sub%'`,(err,res) => {
  if (err) console.log(err)
  fs.writeFile("subscriber.json",JSON.stringify(res),(err) => {
    if (err) return console.log(err)
    readSubscriber()
  })
})

// function to read subcriber
// return: none
var readSubscriber = () => {
  fs.readFile("subscriber.json",(err,data) => {
    if (err) throw err
    list_data = JSON.parse(data)
    console.log(clc.magenta("List Subscriber ->",list_data.length))
  })
}

// API function auth user
// return: none
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

// API function ketika client terkoneksi
// return: none
aedes.on("client",(client) => {
  console.log(clc.blue(`[CLIENT_CONNECTED] Client ${client.id}`))
})

// API funciton ketika client diskonek
// return; none
aedes.on("clientDisconnect",(client) => {
  console.log(clc.red(`[CLIENT_DISCONNECTED] Client  ${client.id}`))
})


// API functuon ketika publihser push 
// return: none
aedes.on("publish",async (packet,client) => {
  if (packet.topic == "payload") {
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
