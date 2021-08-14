'use strict'

var Message = require('../model/messageModel');

exports.announcements = function(req, res) {
    Message.announcements(req.body, function(err, message){
        if(err) return res.status(500).send({error: true, message: "Error retrieving messages", content: err});
        res.json(message);
    });
}

exports.activeThread = function(req, res) {
    Message.activeThread(req.body, function(err, isActiveThread){
        if(err) return res.status(500).send({error: true, message: "Error retrieving active thread", content: err});
        res.json(isActiveThread);
    })
}

exports.chatThread = function(req, res) {
    Message.chatThread(function(err, chatUrl){
        if(err) return res.status(500).send({errr: true, message: "Error retrieving chat thread", content: err});
        res.json(chatUrl);
    });
}