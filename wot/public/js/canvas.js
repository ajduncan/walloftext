'use strict';

window.WOT = window.WOT || {};

// Channel wall

window.WOT.Wall = function () {
    this.channel = document.getElementById("channel");
    this.channel_name = this.channel.getAttribute('name');
    this.editorTimer = '';
    this.last_ta_brick = '';

    this.resizeChannel();
    this.handleEvents();
}


window.WOT.Wall.prototype = {
    handleEvents: function () {
        var self = this;

        window.addEventListener('resize', this.resizeChannel.bind(this), false);
        this.channel.addEventListener('click', this.insertText.bind(this), false);
        $('#editor').click(function (e) { e.stopPropagation(); });
        $('#editor').blur(function () {
            $(this).val().length > 0 ? console.log('Saving...') : $(self.last_ta_brick).remove();
        });
    },

    updateBrick: function () {

    },

    removeBrick: function () {

    },

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

        x -= this.channel.offsetLeft + 10;
        y -= this.channel.offsetTop + 20;

        console.log('x: ' + x + ', y: ' + y);

        $('#editor').css({"visibility": "visible"});

        var ta_brick = $('<pre id="' + uuid_id + '"></pre>')
        $('#channel').append(ta_brick);
        this.last_ta_brick = ta_brick;
        self.moveEditor(x, y, uuid_id);

        ta_brick.css({"top": y + "px", "left": x + "px", "visibility": "visible"});
        ta_brick.draggable({
            containment: 'parent',
            cancel: uuid_id,
            start: function () {
                this.focus();
            },
            stop: function () {
                this.focus();
            }
        });

        ta_brick.bind('click', function(e) {
            e.stopPropagation();

            var x = event.x;
            var y = event.y;
            var id = $(this).attr('id');
            var text = $(this).text();

            x -= 10;
            y -= 38; // WHY

            // x -= self.channel.offsetLeft + 10;
            // y -= self.channel.offsetTop + 20;

            self.moveEditor(x, y, id);
        });
    },

    moveEditor: function (x, y, id) {
        var self = this;
        var brick = document.getElementById(id);
        var rect = brick.getBoundingClientRect();
        var width = (rect.width > 0 ? rect.width : 14);
        var height = (rect.height > 0 ? rect.height : 14);

        $('#editor').val($('#' + id).text());
        $('#editor').unbind('keyup');
        $('#editor').css({'width': width + 'px', 'height': height + 'px'});
        $('#editor').focus();

        $('#editor').css({"top": y + "px", "left": x + "px", "visibility": "visible"});
        $('#editor').keyup(function () {
            var text = $('#editor').val();
            var brick = document.getElementById(id);
            var rect = brick.getBoundingClientRect();
            var width = (rect.width > 0 ? rect.width : 14);
            var height = (rect.height > 0 ? rect.height : 14);

            $('#editor').css({'width': width + 'px', 'height': height + 'px'});
            clearTimeout(self.editorTimer);
            self.editorTimer = setTimeout(self.saveEditor(id), 1000);
        });
        $('#editor').keydown(function () {
            clearTimeout(self.editorTimer);
        });

    },

    saveEditor: function (id) {
        var text = $('#editor').val();
        var brick_text = '<span>' + text + '</span>';
        console.log('Got save editor target id: ' + id + ', value: ' + text);
        $('#' + id).html(brick_text);
        // $('#editor').css({'width': (text.length * 14) + 'px'});
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


// var wot_canvas = new window.WOT.Canvas();
var wot = new window.WOT.Wall();
