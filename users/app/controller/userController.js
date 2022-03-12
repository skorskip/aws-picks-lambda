'use strict'

var User = require('../model/userModel.js');

exports.updateUser = function(req, res) {
    User.updateUser(req.params.id, req.body, function(err, status){
        if(err) return res.status(500).send({error: true, message: "Error updating user", content: err});
        res.json(status);
    });
};

exports.deleteUser = function(req, res) {
    User.deleteUser(req.params.id, function(err, status) {
        if(err) return res.status(500).send({error: true, message: "Error deleting user", content: err});
        res.json(status);
    });
};

exports.createUser = function(req, res) {
    User.createUser(req.body, function(err, status) {
        if(err) return res.status(500).send({error: true, message: "Error creating user", content: err});
        res.json(status);
    });
};

exports.login = function(req, res) {
    User.login(req.headers.authorization, function(err, user) {
        if(err) return res.status(500).send({error: true, message: "Error logging in", content: err});
        res.json(user);
    })
};

exports.getAllUsers = function(req, res) {
    User.getAllUsers(req.query.season, req.query.seasonType, req.query.week, function(err, users) {
        if(err) return res.status(500).send({error: true, message: "Error getting all users", content: err});
        res.json(users);
    })
};

exports.updateUserProfile = function(req, res) {
    User.updateUserImage(req.headers.authorization, function(err, updateResult) {
        if(err) return res.status(500).send({error: true, message: "Error updating user image", content: err});
        res.json(updateResult);
    })
};