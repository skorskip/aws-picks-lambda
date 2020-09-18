'use strict'

var User = require('../model/userModel.js');

exports.updateUser = function(req, res) {
    User.updateUser(req.params.id, req.body, function(err, status){
        if(err) res.send(err);
        res.json(status);
    });
};

exports.deleteUser = function(req, res) {
    User.deleteUser(req.params.id, function(err, status) {
        if(err) res.send(err);
        res.json(status);
    });
};

exports.createUser = function(req, res) {
    User.createUser(req.body, function(err, status) {
        if(err) res.send(err);
        res.json(status);
    });
};

exports.login = function(req, res) {
    User.login(req.body, function(err, user) {
        if(err) res.send(err);
        res.json(user);
    })
};

exports.standings = function(req, res) {
    User.standings(req.params.season, req.params.seasonType, function(err, users) {
        if(err) res.send(err);
        res.json(users);
    })
};

exports.standingsByUser = function(req, res) {
    User.standingsByUser(req.params.season, req.params.seasonType, req.params.week, req.body, function(err, users){
        if(err) res.send(err);
        res.json(users);
    })
};

