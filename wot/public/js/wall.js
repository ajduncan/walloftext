'use strict';

window.WOT = window.WOT || {};

// wall wall

window.WOT.Wall = function () {
    var self = this;
    this.wall = document.getElementById("wall");
    this.wall_name = this.wall.getAttribute('name');
    this.editorTimer = '';
    this.last_ta_brick = '';
    this.active_brick_id = '0';
    this.bugshit = 0;

    // configuration of the observer:
    this.observerConfig = { attributes: true, childList: true, characterData: true, subtree: true };

    // create an observer instance
    this.observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (
                ($(mutation.target).attr('name') == 'brick') &&
                ($(mutation.target).attr('id') != self.active_brick_id) &&
                (self.bugshit <= 1000)
            ) {
                var brick = $(mutation.target);
                var x = brick.position().left;
                var y = brick.position().top;
                var id = brick.attr('id');
                console.log('brick id: ' + id + ', x: ' + x + ', y: ' + y + ' text: ' + brick.html());
                console.log('target: ' + $(mutation.target).attr('id') + ', active brick: ' + self.active_brick_id);
                self.bugshit += 1;
                self.websocket.emit('brickupdate', {
                    wall: self.wall_name,
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
    this.websocket.emit('subscribe', this.wall_name);

    this.websocket.on('bbrickadd', function(data) {
        console.log('Got add broadcast for brick: ' + data.id + ', x: ' + data.x + ', y: ' + data.y);
        self.bbrickAdd(data.x, data.y, data.id, data.text);
    });

    this.websocket.on('bbrickupdate', function(data) {
        if (data.id != self.active_brick_id) {
            console.log('Got update broadcast for brick: ' + data.id + ' text: ' + data.text);
            self.bbrickUpdate(data.x, data.y, data.id, data.text);
        }
    });

    this.websocket.on('bbrickremove', function(data) {
        console.log('Got remove broadcast for brick: ' + data.id);
        self.bbrickRemove(data.id);
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
            wall: self.wall_name,
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

    bbrickRemove: function(id) {
        console.log('Removing brick with id: ' + id);
        $('#' + id).remove();
    },

    bbrickUpdate: function(x, y, id, text) {
        var self = this;

        var ta_brick = $('#' + id);
        ta_brick.css({"top": y + "px", "left": x + "px", "visibility": "visible"});
        ta_brick.html(text);
    },

    bbrickAdd: function (x, y, id, text) {
        var self = this;

        var ta_brick = $('<pre id="' + id + '">' + text + '</pre>');
        ta_brick.attr('name', 'brick');
        $('#wall').append(ta_brick);

        ta_brick.css({"top": y + "px", "left": x + "px", "visibility": "visible"});
        ta_brick.draggable({
            containment: 'parent',
            cancel: id,
            start: function () {
                self.active_brick_id = id;
                this.focus();
            },
            stop: function () {
                this.focus();
                self.active_brick_id = '0';
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

    addBrick: function(event) {
        var x = event.x;
        var y = event.y;
        var uuid_id = uuid.v1();
        var self = this;

        x -= this.wall.offsetLeft + 10;
        y -= this.wall.offsetTop + 20;

        $('#editor').css({"visibility": "visible"});

        var ta_brick = $('<pre id="' + uuid_id + '"></pre>');
        ta_brick.attr('name', 'brick');
        $('#wall').append(ta_brick);
        this.last_ta_brick = ta_brick;
        this.active_brick_id = uuid_id;
        self.moveEditor(x, y, uuid_id);

        this.websocket.emit('brickadd', {
            wall: self.wall_name,
            id: uuid_id,
            x: x,
            y: y
        });

        ta_brick.css({"top": y + "px", "left": x + "px", "visibility": "visible"});
        ta_brick.draggable({
            containment: 'parent',
            cancel: uuid_id,
            start: function () {
                self.active_brick_id = uuid_id;
                this.focus();
            },
            stop: function () {
                this.focus();
                self.active_brick_id = '0';
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
            self.active_brick_id = id;
            self.editorTimer = setTimeout(self.saveEditor(id), 1000);
        });
        $('#editor').keydown(function () {
            clearTimeout(self.editorTimer);
            self.active_brick_id = '0';
        });

    },

    saveEditor: function (id) {
        var text = $('#editor').val();
        var brick_text = '<span>' + text + '</span>';
        $('#' + id).html(brick_text);
    }
}

var wot = new window.WOT.Wall();
