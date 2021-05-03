'user strict'
var Team = require('./teamModel.js');
var League = require('./leagueModel');
var mysql = require('mysql');
var config = require('./db');

var Week = function(week){
    this.number = week.number;
    this.games = week.games;
    this.season = week.season;
    this.teams = week.teams;
};

Week.getWeek = function getWeek(season, week, seasonType, user, result){
    var getWeekSQL = new Promise((resolve, reject) => {
        Week.getWeekSQL(season, week, seasonType, user, function(err, data){
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
    League.leagueSettings(function(err,settings){
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

Week.getWeekSQL = function getWeekSQL(season, week, seasonType, user, result) {
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
            // "AND game_id NOT IN (" +
            //     "SELECT p.game_id " +
            //     "FROM picks p, users u, games g " +
            //     "WHERE g.game_id = p.game_id " + 
            //     "AND g.season = ? " + 
            //     "AND g.week = ? " +
            //     "AND g.season_type = ? " +
            //     "AND p.user_id = u.user_id " +
            //     "AND u.user_id = ? " +
            //     "AND u.password = ?)" + 
            "ORDER BY start_time", [
                season, 
                week, 
                seasonType, 
                season, 
                week, 
                seasonType,
                user.user_id, 
                user.password
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

    Team.getTeamsById(teams, function(err, teams){
        if(err) result(err, null);
        weekObject.teams = teams;
        result(null, weekObject);
    });
};

module.exports= Week;