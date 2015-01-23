'use strict';

window.WOT = window.WOT || {};

// Canvas related

window.WOT.Canvas = function () {
    this.canvas = document.getElementById("wall_canvas");
    this.context = this.canvas.getContext("2d");
    this.wall_name = this.canvas.getAttribute('name');

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
        $('#wall').addLayer({
            type: 'text',
            fillStyle: '#585',
            draggable: true,
            x: x,
            y: y,
            fontSize: 48,
            fontFamily: 'Verdana, sans-serif',
            text: this.wall_name
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

        $('#wall').addLayer({
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
