// import module
const aedes = require('aedes')()
const server = require('net').createServer(aedes.handle)
const mysql = require('mysql')
const aes256 = require('aes256')


// configuration broker
const port = 1884


server.listen(port, function () {
    console.log(`MQTT Broker running on port: ${port}`)
})

aedes.authenticate = (client, username, password, callback) => {
    password = Buffer.from(password, 'base64').toString();
    let conn = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'db_auth'
    })  



    conn.connect(err => {
        if(err) console.log(err)
        conn.query('select * from t_auth where 1',(err,res,fields) => {
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
    })

 


}

aedes.on('client', function (client) {
    console.log(`[CLIENT_CONNECTED] Client ${(client ? client.id : client)} connected to broker ${aedes.id}`)
})