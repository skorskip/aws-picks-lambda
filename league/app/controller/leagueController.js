'use strict'

var League = require('../model/leagueModel.js');

exports.leagueSettings = function(req, res) {
    League.leagueSettings(function(err, settings){
        if(err) res.send(err);
        res.json(settings);
    });
};
