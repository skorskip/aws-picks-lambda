'user strict';
var sql = require('./db.js');
var Team = require('./teamModel.js');
var League = require('./leagueModel');


var Week = function(week){
    this.number = week.number;
    this.games = week.games;
    this.season = week.season;
    this.teams = week.teams;
};

Week.getWeek = function getWeek(season, week, seasonType, user, result){
    var getWeekSQL = new Promise((resolve, reject) => {
        Week.getWeekSQL(season, week, seasonType, user, function(err, data){
            if(err) reject(result(err, null));  
            resolve(data);
        });
    });

    getWeekSQL.then(function(data, err) {
        if(err) result(err, null);
        Week.weekMapper(data, season, week, seasonType, function(errMapping, weekObject){
            if(errMapping) result(errMapping, null);
            result(null, weekObject);
        });
    });
}

Week.getCurrentWeek = function getCurrentWeek(req, result) {
    League.leagueSettings(function(err,settings){
        if(err) result(err, null);
                
        var currWeekObj = {};
        currWeekObj.season = settings.currentSeason;
        currWeekObj.week = settings.currentWeek;
        currWeekObj.seasonType = settings.currentSeasonType;
    
        result(null, currWeekObj);
    });
}

Week.getWeekSQL = function getWeekSQL(season, week, seasonType, user, result) {
    sql.query(
        "SELECT * FROM games " +
        "WHERE season = ? " + 
        "AND week = ? " + 
        "AND season_type = ? " +
        "AND home_spread is not NULL " +
        "AND game_id NOT IN (" +
            "SELECT p.game_id " +
            "FROM picks p, users u, games g " +
            "WHERE g.game_id = p.game_id " + 
            "AND g.season = ? " + 
            "AND g.week = ? " +
            "AND g.season_type = ? " +
            "AND p.user_id = u.user_id " +
            "AND u.user_id = ? " +
            "AND u.password = ?)" + 
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
        
        if(err) { 
            result(err, null);
        } else {
            result(null, data);
        }
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