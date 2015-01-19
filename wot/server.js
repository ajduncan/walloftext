'use strict';

var app = require('./index');
var http = require('http');
var io = require('socket.io').listen(4000);

var server;

/*
 * Create and start HTTP server.
 */

server = http.createServer(app);
server.listen(process.env.PORT || 8000);
server.on('listening', function () {
    console.log('Server listening on http://localhost:%d', this.address().port);
});

/*
 * Create and start socket server.
 */

io.sockets.on('connection', function(socket) {
    socket.on('drawClick', function(data) {
        socket.broadcast.emit('draw', {
            x: data.x,
            y: data.y,
            type: data.type
        });
    });
});