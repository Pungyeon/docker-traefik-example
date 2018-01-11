var express = require('express');
var fs = require('fs');
var os = require('os');

var app = express();

app.get('/', function(req, res) {
    var hostInfo = {
        hostname: os.hostname(),
        network: os.networkInterfaces()['eth0'][0].address
    }
    res.json(hostInfo);
});

app.listen(3000);

console.log("Server listening on port 3000");