'use strict'

var League = require('../model/leagueModel.js');

exports.leagueSettings = async function(req, res) {
    var settings = await League.leagueSettings();
    res.json(settings);
};
