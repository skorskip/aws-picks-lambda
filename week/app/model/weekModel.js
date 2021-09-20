'user strict'
var mysql = require('mysql');
var config = require('./db');
var shared = require('picks-app-shared');

var Week = function(week){
    this.number = week.number;
    this.games = week.games;
    this.season = week.season;
    this.teams = week.teams;
};

Week.getWeek = function getWeek(season, week, seasonType, result){
    var getWeekSQL = new Promise((resolve, reject) => {
        Week.getWeekSQL(season, week, seasonType, function(err, data){
            if(err) reject(err);  
            resolve(data);
        });
    });

    getWeekSQL.then(function(data, err) {
        if(err) {
            console.log(err);
            result(err, null);
        }
        Week.weekMapper(data, season, week, seasonType, function(errMapping, weekObject){
            if(errMapping) {
                console.log(errMapping);
                result(errMapping, null);
            }
            console.log(weekObject);
            result(null, weekObject);
        });
    });
}

Week.getCurrentWeek = function getCurrentWeek(req, result) {
    shared.league(config, function(err,settings){
        if(err) {
            console.log(err);
            result(err, null);
        }
                
        var currWeekObj = {};
        currWeekObj.season = settings.currentSeason;
        currWeekObj.week = settings.currentWeek;
        currWeekObj.seasonType = settings.currentSeasonType;
    
        console.log(currWeekObj);
        result(null, currWeekObj);
    });
}

Week.getWeekSQL = function getWeekSQL(season, week, seasonType, result) {
    var sql = mysql.createConnection(config);

    sql.connect(function(err){
        if(err) { 
            console.log(err);
            result(err, null);
        } 

        sql.query(
            "SELECT * FROM games " +
            "WHERE season = ? " + 
            "AND week = ? " + 
            "AND season_type = ? " +
            "AND home_spread is not NULL " +
            "ORDER BY start_time", [
                season, 
                week, 
                seasonType, 
                season, 
                week, 
                seasonType
            ], function(err, data){
            sql.destroy();
            if(err) { 
                console.log(err);
                result(err, null);
            } else {
                console.log(data);
                result(null, data);
            }
        });
    });
    
};

Week.weekMapper = function(games, season, week, seasonType, result) {
    var weekObject = {};
    weekObject.games = games;
    weekObject.number = week;
    weekObject.season = season;
    weekObject.seasonType = seasonType;
    
    var teams = [];
    if(games.length > 0) {
        games.forEach(game => {
            teams.push(game.away_team_id);
            teams.push(game.home_team_id);
        });
    }

    shared.team(teams, config, function(err, teams){
        if(err) result(err, null);
        weekObject.teams = teams;
        result(null, weekObject);
    });
};

module.exports= Week;