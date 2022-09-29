'use strict'

var Pick = require('../model/pickModel.js');

exports.addPicks = async function(req, res) {
    var status = await Pick.addPicks(req.params.userId, req.body, req.headers.authorization);
    res.json(status);
}

exports.updatePicks = async function(req, res) {
    var status = await Pick.updatePicks(req.body, req.headers.authorization);
    res.json(status);
}

exports.deletePicks = async function(req, res) {
    var status = await Pick.deletePick(req.body, req.headers.authorization);
    res.json(status);
}

exports.deletePicksWeek = async function(req, res) {
    var status = await Pick.deletePicksWeek(
        req.query.season,
        req.query.seasonType,
        req.query.week,
        req.query.user,
        req.headers.authorization);
    res.json(status);
}