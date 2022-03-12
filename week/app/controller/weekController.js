'use strict';
var Week = require('../model/weekModel.js');

exports.getWeek = async function(req, res) {
    var week = await Week.getWeek(req.query.season, 
        req.query.week, 
        req.query.seasonType,
        req.headers.authorization);
    res.json(week);
};