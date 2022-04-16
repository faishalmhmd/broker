// import module
const aedes = require('aedes')()
const server = require('net').createServer(aedes.handle)
const mqtt = require('mqtt')
const mysql = require('mysql')

// configuration broker
const port = 1884




// port 1883
server.listen(port, function () {
    console.log(`MQTT Broker running on port: ${port}`)
})

aedes.on('client', function (client) {
    console.log(`[CLIENT_CONNECTED] Client ${(client ? client.id : client)} connected to broker ${aedes.id}`)
})