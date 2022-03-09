'use strict'
var shared = require('picks-app-shared');
var League = function(){}

League.leagueSettings = function leagueSettings(){
    var res = await shared.league();
    return res;
};

module.exports = League;