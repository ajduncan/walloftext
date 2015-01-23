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
    socket.on('brickadd', function(data) {
        socket.broadcast.emit('bbrickadd', {
            id: data.id,
            x: data.x,
            y: data.y,
            text: ''
        });
    });

    socket.on('brickremove', function(data) {
        socket.broadcast.emit('bbrickremove', {
            id: data.id
        });
    });

    socket.on('brickupdate', function(data) {
        socket.broadcast.emit('bbrickupdate', {
            id: data.id,
            x: data.x,
            y: data.y,
            text: data.text
        });
    });

});
