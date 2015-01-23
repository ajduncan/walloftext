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

    socket.on('subscribe', function(wall) { 
        console.log('Joining wall: ' + wall);
        socket.join(wall); 
    });

    socket.on('unsubscribe', function(wall) {  
        console.log('Leaving wall: ' + wall);
        socket.leave(wall); 
    });

    socket.on('brickadd', function(data) {
        socket.broadcast.to(data.wall).emit('bbrickadd', {
            id: data.id,
            x: data.x,
            y: data.y,
            text: ''
        });
    });

    socket.on('brickremove', function(data) {
        socket.broadcast.to(data.wall).emit('bbrickremove', {
            id: data.id
        });
    });

    socket.on('brickupdate', function(data) {
        socket.broadcast.to(data.wall).emit('bbrickupdate', {
            id: data.id,
            x: data.x,
            y: data.y,
            text: data.text
        });
    });

});
