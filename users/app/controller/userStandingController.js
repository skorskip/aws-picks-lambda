'use strict'
var UserStanding = require('../model/userStandingModel');

exports.standings = function(req, res) {
    UserStanding.standings(req.query.season, req.query.seasonType, req.query.week, function(err, users) {
        if(err) return res.status(500).send({error: true, message: "Error retrieving standings", content: err});
        res.json(users);
    })
};