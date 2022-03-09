'use strict'

var Message = require('../model/messageModel');

exports.announcements = async function(req, res) {
    var message = await Message.announcements(req.body);
    res.json(message);
}

exports.activeThread = async function(req, res) {
    var isActiveThread = await Message.activeThread(req.body);
    res.json(isActiveThread);
}

exports.chatThread = async function(req, res) {
    var chatUrl = await Message.chatThread();
    res.json(chatUrl);
}

exports.setReminder = async function(req, res) {
    var reminderRes = await Message.setReminder(req.body);
    res.json(reminderRes);
}