// import module
const aedes = require('aedes')()
const server = require('net').createServer(aedes.handle)
const mysql = require('mysql')
const aes256 = require('aes256')
const mqtt = require('mqtt')


// configuration broker
const port = 1884

var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_auth'
})  


conn.connect(err => {
    if(err) console.log(err)
   
})

server.listen(port,() => {
    console.log(`MQTT Broker running on port: ${port}`)
})

aedes.authenticate = (client, username, password, callback) => {
    password = Buffer.from(password, 'base64').toString()
        conn.query(`select * from t_auth where id='${client.id}'`,(err,res,fields) => {
            if(err) console.log(err)
            var key = res[0].symetric_key

            let usrnm = aes256.decrypt(key,username)
            let psrwd = aes256.decrypt(key,password)
            if(usrnm === 'admin' && psrwd === 'admin') {
                return callback(null, true)
            }
            const error = new Error('Authentication Failed!! Invalid user credentials.');
            console.log('Error ! Authentication failed.')
            return callback(error, false)
    })

 


}

aedes.on('client', client => {
    console.log(`[CLIENT_CONNECTED] Client ${(client ? client.id : client)} connected to broker ${aedes.id}`)
})

aedes.on('clientDisconnect', client => {
    console.log(`[CLIENT_DISCONNECTED] Client ${(client ? client.id : client)} disconnected from the broker ${aedes.id}`)
})

aedes.on('publish',async (packet,client) => {
    if(client) {
        // conn.query(`SELECT * FROM t_auth WHERE id like '%sub%'`,(err,res) => {
        //     if(err) console.log(err)
        //     res.forEach(el => {
        //         console.log(el.id)
        //     })
        // })

        conn.query(`SELECT * FROM t_auth WHERE id='pub-1'`,(err,res) => {
            if(err) console.log(err)
            console.log(res[0].symetric_key)
            let key = res[0].symetric_key
            let payload = aes256.decrypt(key,Buffer.from(packet.payload,'base64').toString())
            console.log(`${client.id} has published ${payload}`)
        })

  
    }
})
