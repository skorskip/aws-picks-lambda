'use strict'
var mysql = require('mysql');
var config = require('./db');
var jwtDecode = require('jwt-decode');
var Team = require('./teamModel.js');
var Game = require('./gameModel.js');

var Pick = function(pick) {
    this.game_id        = pick.game_id;
    this.team_id        = pick.team_id;
    this.user_id        = pick.user_id;
}

Pick.getUsersPicksByWeek = function getUsersPicksByWeek(userId, season, week, seasonType, result) {
    var sql = mysql.createConnection(config);

    sql.connect(function(err){
        if (err) {
            console.log(err);
            result(err, null);
        }
        sql.query(
            "SELECT p.pick_id, p.game_id, p.team_id, p.user_id, g.away_team_id, g.home_team_id " +
            "FROM picks p, games g " + 
            "WHERE p.game_id = g.game_id " + 
            "AND g.season = ? " +
            "AND g.week = ? " + 
            "AND g.season_type = ? " +
            "AND p.user_id = ? " +
            "AND g.pick_submit_by_date < ?", [season, week, seasonType, userId, new Date()], function(err, res){
            sql.destroy();
            if(err) {
                console.log(err);
                result(err, null);
            }
            else {
                Pick.picksObjectMapper(res, function(mapppingErr, picksObject){
                    console.log(picksObject);
                    result(null, picksObject);
                });
            }
        });
    });
}

Pick.getPicksByWeek = function getPicksByWeek(user, season, week, seasonType, token, result) {
    var userToken = jwtDecode(token)
    if(userToken['cognito:username'] === user.user_name) {
        var sql = mysql.createConnection(config);
        sql.connect(function(err){
            if (err) {
                console.log(err);
                result(err, null);
            }
            sql.query(        
                "SELECT p.pick_id, p.game_id, p.team_id, p.user_id, g.away_team_id, g.home_team_id " +
                "FROM picks p, games g, users u " + 
                "WHERE p.game_id = g.game_id " + 
                "AND g.season = ? " + 
                "AND g.week = ? " +
                "AND g.season_type = ? " +
                "AND u.user_id = p.user_id " +
                "AND u.user_id = ? " +
                "AND u.password = ?", [season, week, seasonType, user.user_id, user.password], function(err, res) {
                sql.destroy();
                if(err) {
                    console.log(err);
                    result(err, null);
                }
                else {
                    Pick.picksObjectMapper(res, function(mapppingErr, picksObject){
                        console.log(picksObject);
                        result(null, picksObject);
                    });
                }
            });
        });
    } else {
        result('Unauthorized', null);
    }

}

Pick.getWeekPicksByGame = function getWeekPicksByGame(season, week, seasonType, result) {
    let weekPicksObject = {};
    let promises_array = [];
    var sql = mysql.createConnection(config);

    sql.connect(function(err){
        if (err) {
            console.log(err);
            result(err, null);
        }
        sql.query(
            "SELECT * FROM games g " +
            "WHERE g.week = ? " + 
            "AND g.season = ? " +
            "AND g.season_type = ?", [week, season, seasonType], function(err, res) {
            sql.destroy();
            if(err) {
                console.log(err);
                result(err, null);
            }
            else {
                res.forEach(game => {
                    promises_array.push(new Promise((resolve, reject) => {
                        Pick.getPicksByGame(game.game_id, function(errPickByGame, picksByGameRes){
                            if(errPickByGame) {
                                console.log(err);
                                result(err, null);
                                reject();
                            }
                            else {
                                weekPicksObject[game.game_id] = picksByGameRes;
                                resolve();
                            }
                        });
                    }));
                });
    
                Promise.all(promises_array).then(()=>{
                    console.log(weekPicksObject);
                    return result(null, weekPicksObject);
                });
            }
        });
    });
}

Pick.getPicksByGame = function getPicksByGame(gameId, result) {
    var sql = mysql.createConnection(config);

    sql.connect(function(err){
        if (err) {
            console.log(err);
            result(err, null);
        }
        sql.query(
            "SELECT p.pick_id, p.game_id, p.team_id, p.user_id, u.user_inits, u.first_name, u.last_name " +
            "FROM picks p, users u, games g " + 
            "WHERE p.user_id = u.user_id " + 
            "AND p.game_id = ? " + 
            "AND g.game_id = p.game_id " +
            "AND g.pick_submit_by_date < ? order by u.first_name, u.last_name", [gameId, new Date()], function(err, res){
            sql.destroy();
            if(err) {
                console.log(err);
                result(err, null);
            }
            else {
                console.log(res);
                result(null, res);
            }
        });
    });
}

Pick.addPicks = function addPicks(picks, result) {
    this.checkPicksDateValid(picks, function(errorCheckDate, valid) {
        if(errorCheckDate) {
            console.log(errorCheckDate);
            result(errorCheckDate, null);
        } else if(valid) {
            let keys = Object.keys(picks[0]);
            let values = picks.map( obj => keys.map( key => obj[key]));
            let query = 'INSERT INTO picks (' + keys.join(',') + ') VALUES ?';
            var sql = mysql.createConnection(config);

            sql.connect(function(err){
                if (err) {
                    console.log(err);
                    result(err, null);
                }
                sql.query(query, [values], function(err, res) {
                    sql.destroy();
                    if(err) {
                        console.log(err);
                        result(null, err);
                    }
                    else {
                        console.log("SUCCESS")
                        result(null, "SUCCESS");
                    }
                });
            });
        } else {
            console.log("PAST SUBMISSION DATE")
            result(null, "PAST SUBMISSION DATE")
        }
    });
}

Pick.getPick = function getPick(id, result) {
    var sql = mysql.createConnection(config);

    sql.connect(function(err){
        if (err) {
            console.log(err);
            result(err, null);
        }
        sql.query("SELECT * FROM picks WHERE pick_id = ?", id, function(err, res) {
            sql.destroy();
            if(err) {
                console.log(err);
                result(err, null);
            }
            else {
                console.log(res);
                result(null, res);
            }
        });
    });

}

Pick.deletePick = function deletePick(id, result) {
    var sql = mysql.createConnection(config);

    sql.connect(function(err){
        if (err) {
            console.log(err);
            result(err, null);
        }
        sql.query("DELETE FROM picks WHERE pick_id = ?", id, function(err, res) {
            sql.destroy();
            if(err) {
                console.log(err);
                result(err, null);
            }
            else {
                console.log("SUCCESS")
                result(null, "SUCCESS");
            }
        });
    });
}

Pick.updatePick = function updatePick(id, pick, result) {
    var picks = [];
    picks.push(pick);

    this.checkPicksDateValid(picks, function(errorCheckDate, valid) {
        if(errorCheckDate) {
            console.log(errorCheckDate);
            result(errorCheckDate, null);
        } else {
            if(valid) {
                var sql = mysql.createConnection(config);

                sql.connect(function(err){
                    if (err) {
                        console.log(err);
                        result(err, null);
                    }
                    sql.query("UPDATE picks SET team_id = ? WHERE pick_id = ?", [pick.team_id, id], function(err, res) {
                        sql.destroy();
                        if(err) {
                            console.log(err)
                            result(err, null);
                        }
                        else {
                            console.log("SUCCESS")
                            result(null, "SUCCESS");
                        }
                    });
                });

            } else {
                console.log("PAST SUBMISSION DATE")
                result(null, "PAST SUBMISSION DATE");
            }
        }
    });
}

Pick.checkPicksDateValid = function checkPicksDateValid(picks, result) {
    let gameArray = [];
    for(var i = 0; i < picks.length; i++) {
        gameArray.push(picks[i].gameId);
    }
    var sql = mysql.createConnection(config);

    sql.connect(function(err){
        if (err) {
            console.log(err);
            result(err, null);
        }
        sql.query("SELECT COUNT(*) as count FROM games WHERE game_id in (?) AND pick_submit_by_date < ?", [gameArray, new Date().toISOString()], function(err, res) {
            sql.destroy();
            if(err) {
                console.log(err);
                result(err, null);
            }
            else {
                result(null,res[0].count == 0);
            }
        });
    });
}

Pick.picksObjectMapper = function picksObjectMapper(picks, result) {

    var teams = [];
    var games  = [];

    picks.forEach(pick => {
        games.push(pick.game_id);
        teams.push(pick.away_team_id);
        teams.push(pick.home_team_id);
    });

    var pickObject = {};
    pickObject.picks = picks;
    pickObject.teams = [];
    pickObject.games = [];

    Team.getTeamsById(teams, function(err, teamObjects){
        if(err){}
        pickObject.teams = teamObjects;
        Game.getGamesById(games, function(err, gameObjects){
            if(err){}
            pickObject.games = gameObjects;
            result(null, pickObject);
        });
    });    
}

module.exports = Pick;

