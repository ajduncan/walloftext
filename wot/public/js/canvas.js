'use strict';

window.WOT = window.WOT || {};

window.WOT.Canvas = function () {
    this.canvas = document.getElementById("channel");
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

    this.handleDrag();
};

window.WOT.Canvas.prototype = {
    renderCanvas: function (x, y) {
        // redis magic x,y position
        this.context.fillStyle = "blue";
        this.context.font = "bold 16px Arial";
        this.context.fillText(this.channel_name, this.canvas.width/2, this.canvas.height/2);
    },

    resizeCanvas: function () {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight / 2;
        this.renderCanvas(0, 0);
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
    },

    handleDrag: function () {
        $('channel').on('drag dragstart dragend', function(e, ui) {
            console.log('Got drag event...');
        });
    }
}

var wot = new window.WOT.Canvas();
