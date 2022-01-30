'user strict'
var shared = require('picks-app-shared');
var queries = require('../utils/queries');

var Week = function(season, week, seasonType, games, picks, teams, userPicks){
    this.number = week;
    this.games = games;
    this.season = season;
    this.seasonType = seasonType;
    this.teams = teams;
    this.picks = picks;
    this.userPicks = userPicks
};

Week.getWeek = function getWeek(season, week, seasonType, token, result){

    var games = new Promise((resolve, reject) => {
        Week.getWeekSQL(season, week, seasonType, function(err, games){
            if(err) reject(err);  
            resolve(games);
        });
    });

    var picks = new Promise((resolve, reject) => {
        shared.picksByWeek(season, seasonType, week, token, function(picksByWeekErr, pickByWeek) {
            if(picksByWeekErr) reject(picksByWeekErr);
            resolve(pickByWeek);        
        });
    });

    var userPicks = new Promise((resolve, reject) => {
        shared.userPicksByWeek(season, seasonType, week, function(userPicksByWeekErr, userPicksByWeek) {
            if(userPicksByWeekErr) reject(userPicksByWeekErr);
            resolve(userPicksByWeek);
        });
    });

    Promise.all([games, picks, userPicks]).then((values) => {
        Week.weekMapper(values[0], values[1], values[2], season, week, seasonType, function(errMapping, weekObject){
            if(errMapping) {
                console.error(errMapping);
                return result(errMapping, null);
            }
            console.log(weekObject);
            return result(null, weekObject);
        });
    }).catch(error => {
        console.error(error);
        return result(error, null);
    });
}

Week.getWeekSQL = function getWeekSQL(season, week, seasonType, result) {
    shared.fetch(queries.ALL_GAMES_BY_WEEK, [season, week, seasonType], function(err, data){
        if(err) { 
            console.error(err);
            return result(err, null);
        } else {
            return result(null, data);
        }
    });
};

Week.weekMapper = function(games, picks, userPicks, season, week, seasonType, result) {
    var teams = [];
    if(games.length > 0) {
        games.forEach(game => {
            teams.push(game.away_team_id);
            teams.push(game.home_team_id);
        });
    }

    shared.team(teams, function(err, teams){
        if(err) return result(err, null);
        var response = new Week(season, week, seasonType, games, picks, teams, userPicks);
        return result(null, response);
    });
};

module.exports= Week;