'use strict'

var Pick = require('../model/pickModel.js');

exports.getUsersPicksByWeek = function(req, res) {
    Pick.getUsersPicksByWeek(req.params.userId, req.params.season, req.params.week, req.params.seasonType, function(err, picks) {
        if(err) res.send(err);
        res.json(picks);
    });
};

exports.getPicksByWeek = function(req, res) {
    Pick.getPicksByWeek(req.body, req.params.season, req.params.week, req.params.seasonType, function(err, picks) {
        if(err) res.send(err);
        res.json(picks);
    });
};

exports.getWeekPicksByGame = function(req, res) {
    Pick.getWeekPicksByGame(req.params.season, req.params.week, req.params.seasonType, function(err, picks) {
        if(err) res.send(err);
        res.json(picks);
    });
};

exports.addPicks = function(req, res) {
    Pick.addPicks(req.body, function(err, status) {
        if(err) res.send(err);
        res.json(status);
    });
};

exports.getPick = function(req, res) {
    Pick.getPick(req.params.id, function(err, pick) {
        if(err) res.send(err);
        res.json(pick);
    });
};

exports.updatePick = function(req, res) {
    Pick.updatePick(req.params.id, req.body, function(err, status) {
        if(err) res.send(err);
        res.json(status);
    });
};

exports.deletePick = function(req, res) {
    Pick.deletePick(req.params.id, function(err, status) {
        if(err) res.send(err);
        res.json(status);
    });
}