'use strict'

var Message = require('../model/messageModel');

exports.announcements = function(req, res) {
    Message.announcements(req.body, function(err, message){
        if(err) res.send(err);
        res.json(message);
    });
}