'use strict'

var Pick = require('../model/pickModel.js');

exports.getUsersPicksByWeek = function(req, res) {
    Pick.getUsersPicksByWeek(req.query.user, req.query.season, req.query.week, req.query.seasonType, function(err, picks) {
        if(err) return res.status(500).send({error: true, message: "Error retrieving users picks", content: err});
        res.json(picks);
    });
};

exports.getPicksByWeek = function(req, res) {
    Pick.getPicksByWeek(req.query.season, req.query.week, req.query.seasonType, req.headers.authorization, function(err, picks) {
        if(err) return res.status(500).send({error: true, message: "Error retrieving picks", content: err});
        res.json(picks);
    });
};

exports.getWeekPicksByGame = function(req, res) {
    Pick.getWeekPicksByGame(req.query.season, req.query.week, req.query.seasonType, function(err, picks) {
        if(err) return res.status(500).send({error: true, message: "Error retrieving picks by game", content: err});
        res.json(picks);
    });
};

exports.addPicks = function(req, res) {
    Pick.addPicks(req.params.userId, req.body, req.headers.authorization, function(err, status) {
        if(err) return res.status(500).send({error: true, message: "Error adding picks", content: err});
        res.json(status);
    })
}

exports.updatePicks = function(req, res) {
    Pick.updatePicks(req.body, req.headers.authorization, function(err, status) {
        if(err) return res.status(500).send({error: true, message: "Error updating pick", content: err});
        res.json(status);
    })
}

exports.deletePicks = function(req, res) {
    Pick.deletePicks(req.body, req.headers.authorization, function(err, status) {
        if(err) return res.status(500).send({error: true, message: "Error updating pick", content: err});
        res.json(status);
    })
}