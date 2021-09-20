'use strict'
var mysql = require('mysql');
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

League.leagueSettings = function leagueSettings(dbConfig, result){
    
    var sql = mysql.createConnection(dbConfig);
    
    sql.connect(function(err){
        if (err) {
            console.log(err);
            result(err, null);
        }
        sql.query(
            'SELECT settings ' +
            'FROM config ' +
            'WHERE status = "active"', [], function(err, res){
                sql.destroy();
                if(err) {
                    console.log(err);
                    result(err, null);
                }
                else {
                    console.log(JSON.parse(res[0].settings));
                    result(null, JSON.parse(res[0].settings));
                }
        });
    });

};

module.exports = League;