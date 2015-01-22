'use strict';

var WallModel = require('../../models/wall');

module.exports = function (router) {

    var model = new WallModel();

    router.get('/', function (req, res) {
        res.send('You are at the main wall index.');
    });

    router.post('/', function (req, res) {
        var id = req.body.wall;
        res.redirect('/wall/' + id);
    });

    router.get('/:wall', function(req, res) {
        var wall_name = req.params.wall;
        model.name = wall_name;
        res.render('wall', model);
    });
};
