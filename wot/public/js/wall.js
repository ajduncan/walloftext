'use strict';

window.WOT = window.WOT || {};

// wall wall

window.WOT.Wall = function () {
    var self = this;
    this.wall = document.getElementById("wall");
    this.wall_name = this.wall.getAttribute('name');
    this.editorTimer = '';
    this.last_ta_brick = '';

    // configuration of the observer:
    this.observerConfig = { attributes: true, childList: true, characterData: true, subtree: true };

    // create an observer instance
    this.observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            console.log('Got mutation type: ' + mutation.type);
            if ($(mutation.target).attr('name') == 'brick') {
                var brick = $(mutation.target);
                var x = brick.position().left;
                var y = brick.position().top;
                var id = brick.attr('id');
                // console.log('brick html: ' + $(mutation.target).html() );
                console.log('brick id: ' + id + ', x: ' + x + ', y: ' + y);
                // emit serialized (fix!) brick updates.
                self.websocket.emit('brickupdate', {
                    id: id,
                    x: x,
                    y: y,
                    text: brick.html()
                });
            }
        });
    });

    // observe the brick:
    var target = document.querySelector('#wall');

    // pass in the target node, as well as the observer options
    this.observer.observe(target, this.observerConfig);

    this.websocket = io.connect('http://localhost:4000');

    this.websocket.on('bbrickadd', function(data) {
        console.log('Got add broadcast for brick: ' + data.id);
    });

    this.websocket.on('bbrickupdate', function(data) {
        console.log('Got update broadcast for brick: ' + data.id);
    });

    this.websocket.on('bbrickremove', function(data) {
        console.log('Got remove broadcast for brick: ' + data.id);
    });

    this.resizeWall();
    this.handleEvents();
}


window.WOT.Wall.prototype = {
    handleEvents: function () {
        var self = this;

        window.addEventListener('resize', this.resizeWall.bind(this), false);
        this.wall.addEventListener('click', this.addBrick.bind(this), false);
        $('#editor').click(function (e) { e.stopPropagation(); });
        $('#editor').blur(function () {
            var id = $(self.last_ta_brick).attr('id');
            $(this).val().length > 0 ? self.updateBrick(id) : self.removeBrick(id);
        });
    },

    updateBrick: function (id) {
        console.log('Saving brick with id: ' + id);
    },

    removeBrick: function (id) {
        console.log('Removing brick with id: ' + id);
        $(this.last_ta_brick).remove();
        this.websocket.emit('brickremove', {
            id: id
        });
    },

    renderWall: function (x, y) {
        // redis magic x,y position
        // stub for now
    },

    resizeWall: function () {
        this.wall.width = window.innerWidth;
        this.wall.height = window.innerHeight / 2;
        this.renderWall(this.wall.width/2, this.wall.height/2);
    },

    addBrick: function(event) {
        var x = event.x;
        var y = event.y;
        var uuid_id = uuid.v1();
        var self = this;

        x -= this.wall.offsetLeft + 10;
        y -= this.wall.offsetTop + 20;

        $('#editor').css({"visibility": "visible"});

        var ta_brick = $('<pre id="' + uuid_id + '"></pre>')
        ta_brick.attr('name', 'brick');
        $('#wall').append(ta_brick);
        this.last_ta_brick = ta_brick;
        self.moveEditor(x, y, uuid_id);

        this.websocket.emit('brickadd', {
            id: uuid_id
        });

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

        ta_brick.on('click', function(e) {
            e.stopPropagation();

            var x = $(this).position().left;
            var y = $(this).position().top;
            var id = $(this).attr('id');

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
        $('#' + id).html(brick_text);
    }
}

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
var wot = new window.WOT.Wall();
