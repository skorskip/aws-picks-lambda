'use strict'
var shared = require('picks-app-shared');
var League = function(){}

League.leagueSettings = function leagueSettings(result){
    shared.league(function(err, res) {
        if(err) {
            console.error(err);
            return result(err, null);
        }
        console.log(res);
        return result(null, res);
    });
};

module.exports = League;