const server = require('ws')
const ws_server = new server.Server({ port: 4000 })

ws_server.on('connection', socket => {
    console.log('ada yang konek tuch')

    socket.on('message', msg => {
        console.log(`pesan dari client ${msg}`)
        ws_server.clients.forEach(client => {
            client.send(msg)
        })
    })

})