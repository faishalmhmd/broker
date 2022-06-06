const aedes = require('aedes')();
const server = require('net').createServer(aedes.handle);
const port = 9000;

server.listen(port, function () {
    console.log(`MQTT Broker running on port: ${port}`);
});
