'use strict';
var Week = require('../model/weekModel.js');

exports.getWeek = function(req, res) {
    Week.getWeek(req.query.season, 
        req.query.week, 
        req.query.seasonType,
        req.headers.authorization,
        function(err, week) {
        if(err) return res.status(500).send({error: true, message: "Error retrieving games", content: err});
        res.json(week);
    });
};