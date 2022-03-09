'use strict'

var fetch = require('../db/fetch');

const query = 'SELECT settings ' +
'FROM config ' +
'WHERE status = "active"';

var League = function(league){
    this.currentWeek = league.currentWeek;
    this.currentSeason = league.currentSeason;
    this.maxTotalPicks = league.maxTotalPicks;
    this.currentSeasonType = league.currentSeasonType;
    this.messageSource = {
        channel: league.messageSource.channel,
        chatChannel: league.messageSource.chatChannel
    }
    this.bonus = {
        currentPotAmt: league.bonus.currentPotAmt
    }
}

League.leagueSettings = async function leagueSettings(){
    let res = await fetch.query(query, []);
    return JSON.parse(res[0].settings);
};

module.exports = League;