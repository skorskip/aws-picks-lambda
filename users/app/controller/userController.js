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
    User.login(req.body, function(err, user) {
        if(err) return res.status(500).send({error: true, message: "Error logging in", content: err});
        res.json(user);
    })
};

exports.standings = function(req, res) {
    User.standings(req.query.season, req.query.seasonType, function(err, users) {
        if(err) return res.status(500).send({error: true, message: "Error retrieving standings", content: err});
        res.json(users);
    })
};

exports.standingsByUser = function(req, res) {
    User.standingsByUser(req.query.season, req.query.seasonType, req.query.week, req.body, function(err, users){
        if(err) return res.status(500).send({error: true, message: "Error retrieving user stats", content: err});
        res.json(users);
    })
};

exports.getUserPicksLimit = function(req, res) {
    User.getUserPicksLimit(req.query.season, req.query.seasonType, req.query.userId, function(err, pickLimit) {
        if(err) return res.status(500).send({error: true, message: "Error retrieving user's picks limit"});
        res.json(pickLimit)
    })
};

