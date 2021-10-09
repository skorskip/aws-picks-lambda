'use strict'
var mysql = require('mysql');
var config = require('../utils/db');
var shared = require('picks-app-shared');
var League = function(){}

League.leagueSettings = function leagueSettings(result){
    shared.league(config, function(err, res) {
        if(err) {
            console.error(err);
            result(err, null);
        }
        else {
            console.log(res);
            result(null, res);
        }
    });
};

module.exports = League;