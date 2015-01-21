'use strict';

window.WOT = window.WOT || {};

// Channel wall

window.WOT.Wall = function () {
    this.channel = document.getElementById("channel");
    this.channel_name = this.channel.getAttribute('name');
    this.editorTimer = '';

    this.resizeChannel();
    window.addEventListener('resize', this.resizeChannel.bind(this), false);
    this.channel.addEventListener('click', this.insertText.bind(this), false);
    $('#editor').click(function (e) { e.stopPropagation(); });
}


window.WOT.Wall.prototype = {
    renderChannel: function (x, y) {
        // redis magic x,y position
        // stub for now
    },

    resizeChannel: function () {
        this.channel.width = window.innerWidth;
        this.channel.height = window.innerHeight / 2;
        this.renderChannel(this.channel.width/2, this.channel.height/2);
    },

    insertText: function(event) {
        var x = event.x;
        var y = event.y;
        var uuid_id = uuid.v1();
        var self = this;

        x -= this.channel.offsetLeft;
        y -= this.channel.offsetTop;

        console.log('x: ' + x + ', y: ' + y);

        $('#editor').css({"visibility": "hidden"});

        var ta_node = $('<pre id="' + uuid_id + '"><span>...!</span></pre>')
        $('#channel').append(ta_node);

        ta_node.css({"top": y + "px", "left": x + "px", "visibility": "visible"});
        ta_node.draggable({
            containment: 'parent',
            cancel: uuid_id,
            start: function () {
                this.focus();
            },
            stop: function () {
                this.focus();
            }
        });

        ta_node.bind('click', function(e) {
            console.log('clicked!');
            e.stopPropagation();
            var x = event.x;
            var y = event.y;
            var id = $(this).attr('id');

            x -= self.channel.offsetLeft;
            y -= self.channel.offsetTop;

            $('#editor').text(ta_node.text());
            $('#editor').css({"top": y + "px", "left": x + "px", "visibility": "visible"});
            // $('#editor').unbind('keyup');
            $('#editor').keyup(function () {
                clearTimeout(self.editorTimer);
                self.editorTimer = setTimeout(self.saveEditor(id), 5000);
            });
            $('#editor').keydown(function () {
                clearTimeout(self.editorTimer);
            });

        });
    },

    saveEditor: function (id) {
        var text = $('#editor').val();
        console.log('Got save editor target id: ' + id + ', value: ' + text);
        $('#' + id).html('<span>' + text + '</span>');
    }
}

// Canvas related

window.WOT.Canvas = function () {
    this.canvas = document.getElementById("channel_canvas");
    this.context = this.canvas.getContext("2d");
    this.channel_name = this.canvas.getAttribute('name');

    this.context.fillStyle = "solid";
    this.context.strokeStyle = "#ECD018";
    this.context.lineWidth = 5;
    this.context.lineCap = "round";

    this.websocket = io.connect('http://localhost:4000');
    this.websocket.on('draw', function(data) {
      return this.draw(data.x, data.y, data.type);
    });

    // resize the canvas to fill browser window dynamically
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeCanvas.bind(this), false);

    this.canvas.addEventListener('dblclick', this.insertTextLayer.bind(this), false);

};


window.WOT.Canvas.prototype = {
    renderCanvas: function (x, y) {
        // redis magic x,y position
        // stub for now
        $('#channel').addLayer({
            type: 'text',
            fillStyle: '#585',
            draggable: true,
            x: x, 
            y: y,
            fontSize: 48,
            fontFamily: 'Verdana, sans-serif',
            text: this.channel_name
        }).drawLayers();
    },

    resizeCanvas: function () {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight / 2;
        this.renderCanvas(this.canvas.width/2, this.canvas.height/2);
    },

    insertTextLayer: function(event) {
        console.log('got a click event on the canvas');
        var x = event.x;
        var y = event.y;

        x -= this.canvas.offsetLeft;
        y -= this.canvas.offsetTop;

        $('#channel').addLayer({
            type: 'text',
            fillStyle: '#585',
            draggable: true,
            x: x, 
            y: y,
            fontSize: 48,
            fontFamily: 'Verdana, sans-serif',
            text: 'Hello!',
            
            click: function(layer) {
                layer.text = 'hhhhhhherp';
                console.log('herp click');
            },

            keydown: function(event) {
                console.log('GOT A KEY!!!');
            }
        }).drawLayers();
    },

    draw: function (x, y, type) {
        if (type === "dragstart") {
            this.context.beginPath();
            return context.moveTo(x, y);
        } else if (type === "drag") {
            this.context.lineTo(x, y);
            return this.context.stroke();
        } else {
            return this.context.closePath();
        }
    }
}


var wot_canvas = new window.WOT.Canvas();
var wot = new window.WOT.Wall();
