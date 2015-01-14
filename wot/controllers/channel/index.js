'use strict';

var ChannelModel = require('../../models/channel');

module.exports = function (router) {

    var model = new ChannelModel();

    router.get('/', function (req, res) {
        res.send('You are at the main channel index.');
    });

    router.post('/', function (req, res) {
        var id = req.body.channel;
        res.redirect('/channel/' + id);
    });

    router.get('/:channel', function(req, res) {
        var channel_name = req.params.channel;
        model.name = channel_name;
        res.render('channel', model);
    });
};
