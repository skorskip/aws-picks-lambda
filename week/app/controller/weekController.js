'use strict';
var Week = require('../model/weekModel.js');

exports.getWeek = function(req, res) {
    var week = Week.getWeek(req.query.season, 
        req.query.week, 
        req.query.seasonType,
        req.headers.authorization);
    res.json(week);
};