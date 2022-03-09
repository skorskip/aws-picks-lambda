'use strict'

var User = require('../model/userModel.js');

exports.updateUser = async function(req, res) {
    var status = await User.updateUser(req.params.id, req.body);
    res.json(status);
};

exports.deleteUser = async function(req, res) {
    var status = await User.deleteUser(req.params.id);
    res.json(status);
};

exports.createUser = async function(req, res) {
    var status = await User.createUser(req.body);
    res.json(status);
};

exports.login = async function(req, res) {
    var user = await User.login(req.headers.authorization);
    res.json(user)
};

exports.getAllUsers = async function(req, res) {
    var users = await User.getAllUsers(req.query.season, req.query.seasonType, req.query.week);
    res.json(users);
};

exports.updateUserProfile = async function(req, res) {
    var updateResult = await User.updateUserImage(req.headers.authorization);
    res.json(updateResult);
};