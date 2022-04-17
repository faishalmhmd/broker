// import module
const aedes = require('aedes')()
const server = require('net').createServer(aedes.handle)


// configuration broker
const port = 1884


server.listen(port, function () {
    console.log(`MQTT Broker running on port: ${port}`)
})

aedes.authenticate = (client, username, password, callback) => {
    // password = Buffer.from(password, 'base64').toString();
    console.log(password.toString())
    console.log(username)
    console.log(client.id)
    // const error = new Error('Authentication Failed!! Invalid user credentials.')
    // console.log('Error ! Authentication failed.')
    // return callback(error, false)
}

aedes.on('client', function (client) {
    console.log(`[CLIENT_CONNECTED] Client ${(client ? client.id : client)} connected to broker ${aedes.id}`)
})