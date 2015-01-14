'use strict';

(function() {
    var canvas = document.getElementById("channel");
    var context = canvas.getContext("2d");
    var channel_name = canvas.getAttribute('name');

    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false);

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight / 2;
        renderCanvas(0, 0);
    }
    resizeCanvas();

    function renderCanvas(x, y) {
            // redis magic x,y position
    }

    context.fillStyle = "blue";
    context.font = "bold 16px Arial";
    context.fillText(channel_name, canvas.width/2, canvas.height/2);
})();
