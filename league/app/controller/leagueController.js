'use strict'

var League = require('../model/leagueModel.js');

exports.leagueSettings = function(req, res) {
    League.leagueSettings(function(err, settings){
        if(err) res.status(500).send({error: true, message: "Error retrieving league settings", content: err});
        res.json(settings);
    });
};
