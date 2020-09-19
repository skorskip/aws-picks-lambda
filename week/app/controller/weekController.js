'use strict';
var Week = require('../model/weekModel.js');

exports.getCurrentWeek = function(req, res) {
    Week.getCurrentWeek(req, function(err, week) {
        if (err) res.send(err);
        res.json(week);
    });
};

exports.getWeek = function(req, res) {
    Week.getWeek(req.query.season, 
        req.query.week, 
        req.query.seasonType, 
        req.body, 
        function(err, week) {
        if(err) res.send(err);
        res.json(week);
    });
};