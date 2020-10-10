'use strict'

var Message = require('../model/messageModel');

exports.announcements = function(req, res) {
    Message.announcements(req.body, function(err, message){
        if(err) return res.status(500).send({error: true, message: "Error retrieving messages", content: err});
        res.json(message);
    });
}