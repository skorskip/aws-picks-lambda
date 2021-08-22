'use strict'

var Pick = require('../model/pickModel.js');

exports.getUsersPicksByWeek = function(req, res) {
    Pick.getUsersPicksByWeek(req.query.user, req.query.season, req.query.week, req.query.seasonType, function(err, picks) {
        if(err) return res.status(500).send({error: true, message: "Error retrieving users picks", content: err});
        res.json(picks);
    });
};

exports.getPicksByWeek = function(req, res) {
    Pick.getPicksByWeek(req.body, req.query.season, req.query.week, req.query.seasonType, req.headers.authorization, function(err, picks) {
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
    Pick.addPicks(req.body, function(err, status) {
        if(err) return res.status(500).send({error: true, message: "Error adding picks", content: err});
        res.json(status);
    });
};

exports.updatePick = function(req, res) {
    Pick.updatePick(req.params.id, req.body, function(err, status) {
        if(err) return res.status(500).send({error: true, message: "Error updating pick", content: err});
        res.json(status);
    });
};

exports.deletePick = function(req, res) {
    Pick.deletePick(req.params.id, function(err, status) {
        if(err) return res.status(500).send({error: true, message: "Error deleting pick", content: err});
        res.json(status);
    });
}

exports.addPicksV2 = function(req, res) {
    Pick.addPicksV2(req.params.userId, req.body, req.headers.authorization, function(err, status) {
        if(err) return res.status(500).send({error: true, message: "Error adding picks", content: err});
        res.json(status);
    })
}

exports.updatePicksV2 = function(req, res) {
    Pick.updatePickV2(req.params.userId, req.body, req.headers.authorization, function(err, status) {
        if(err) return res.status(500).send({error: true, message: "Error updating pick", content: err});
        res.json(status);
    })
}

exports.deletePicksV2 = function(req, res) {
    Pick.deletePickV2(req.params.userId, req.body, req.headers.authorization, function(err, status) {
        if(err) return res.status(500).send({error: true, message: "Error updating pick", content: err});
        res.json(status);
    })
}