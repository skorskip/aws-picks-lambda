'user strict'
var mysql = require('mysql');
var config = require('../utils/db');
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
        shared.picksByWeek(season, seasonType, week, token, config, function(picksByWeekErr, pickByWeek) {
            if(picksByWeekErr) reject(picksByWeekErr);
            resolve(pickByWeek);        
        });
    });

    var userPicks = new Promise((resolve, reject) => {
        shared.userPicksByWeek(season, seasonType, week, config, function(userPicksByWeekErr, userPicksByWeek) {
            if(userPicksByWeekErr) reject(userPicksByWeekErr);
            resolve(userPicksByWeek);
        });
    });

    Promise.all([games, picks, userPicks]).then((values) => {
        Week.weekMapper(values[0], values[1], values[2], season, week, seasonType, function(errMapping, weekObject){
            if(errMapping) {
                console.error(errMapping);
                result(errMapping, null);
            }
            console.log(weekObject);
            result(null, weekObject);
        });
    }).catch(error => {
        console.error(error);
        result(error, null);
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
            queries.ALL_GAMES_BY_WEEK, [
                season, 
                week, 
                seasonType
            ], function(err, data){
            sql.destroy();
            if(err) { 
                console.error(err);
                result(err, null);
            } else {
                result(null, data);
            }
        });
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

    shared.team(teams, config, function(err, teams){
        if(err) result(err, null);
        weekObject.teams = teams;
        var response = new Week(season, week, seasonType, games, picks, teams, userPicks);
        result(null, response);
    });
};

module.exports= Week;