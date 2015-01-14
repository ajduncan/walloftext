'use strict';

(function() {
    var canvas = document.getElementById('channel'),
    context = canvas.getContext('2d');

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
})();
