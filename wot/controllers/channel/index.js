'use strict';

var channel = require('../../models/channel');

module.exports = function (router) {
    router.get('/', function (req, res) {
        res.send('You are at the main channel index.');
    });

    router.post('/', function (req, res) {
        var id = req.body.channel;
        res.redirect('/channel/' + id);
    });

    router.get('/:channel', function(req, res) {
        var channel_name = req.params.channel;
        res.send('you are at the ' + channel_name + ' channel');

    });
};