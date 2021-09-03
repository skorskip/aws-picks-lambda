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

    sql.connect(function(connectErr){
        if (connectErr) {
            console.log(connectErr);
            result(connectErr, null);
        }
        sql.query(
            "SELECT p.pick_id, p.game_id, p.team_id, p.user_id, g.away_team_id, g.home_team_id, g.pick_submit_by_date, g.winning_team_id, g.game_status " +
            "FROM picks p, games g " + 
            "WHERE p.game_id = g.game_id " + 
            "AND g.season = ? " +
            "AND g.week = ? " + 
            "AND g.season_type = ? " +
            "AND p.user_id = ? " +
            "AND g.pick_submit_by_date < ? " +
            "ORDER BY g.start_time ASC", [season, week, seasonType, userId, new Date()], function(err, res){
            sql.destroy();
            if(err) {
                console.log(err);
                result(err, null);
            }
            else {
                Pick.picksObjectMapper(res, function(mappingErr, picksObject){
                    console.log(picksObject);
                    result(null, picksObject);
                });
            }
        });
    });
}

Pick.getPicksByWeek = function getPicksByWeek(season, week, seasonType, token, result) {
    var userToken = jwtDecode(token)
    var sql = mysql.createConnection(config);
    var username = userToken['cognito:username'];
    sql.connect(function(connectErr){
        if (connectErr) {
            console.log(connectErr);
            result(connectErr, null);
        }
        sql.query(        
            "SELECT p.pick_id, p.game_id, p.team_id, p.user_id, g.away_team_id, g.home_team_id, g.pick_submit_by_date " +
            "FROM picks p, games g, users u " + 
            "WHERE p.game_id = g.game_id " + 
            "AND g.season = ? " + 
            "AND g.week = ? " +
            "AND g.season_type = ? " +
            "AND u.user_id = p.user_id " +
            "AND u.user_name = ? " +
            "ORDER BY g.start_time ASC", [season, week, seasonType, username], function(err, res) {
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

Pick.getWeekPicksByGame = function getWeekPicksByGame(season, week, seasonType, result) {
    let weekPicksObject = {};
    let promises_array = [];
    var sql = mysql.createConnection(config);

    sql.connect(function(connectErr){
        if (connectErr) {
            console.log(connectErr);
            result(connectErr, null);
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

    sql.connect(function(connectErr){
        if (connectErr) {
            console.log(connectErr);
            result(connectErr, null);
        }
        sql.query(
            "SELECT p.pick_id, p.game_id, p.team_id, p.user_id, u.user_inits, u.first_name, u.last_name, g.pick_submit_by_date " +
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

Pick.getCurrentPicks = function getCurrentPicks(token, result) {
    var userToken = jwtDecode(token)
    var sql = mysql.createConnection(config);
    var username = userToken['cognito:username'];

    sql.connect(function(connectErr){
        if (connectErr) {
            console.log(connectErr);
            result(connectErr, null);
        }
        sql.query(        
            "SELECT p.pick_id, p.game_id, p.team_id, p.user_id, g.away_team_id, g.home_team_id, g.pick_submit_by_date " +
            "FROM picks p, games g, users u, config c " + 
            "WHERE p.game_id = g.game_id " +
            "AND c.status = \'active\' " +
            "AND g.season = JSON_VALUE(c.settings, \'$.currentSeason\') " + 
            "AND g.week = JSON_VALUE(c.settings, \'$.currentWeek\') " +
            "AND g.season_type = JSON_VALUE(c.settings, \'$.currentSeasonType\') " +
            "AND u.user_name = ? " +
            "AND p.user_id = u.user_id " +
            "ORDER BY g.start_time", [username], function(err, res) {
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

Pick.addPicks = function addPicks(userId, picks, token, result) {
    this.submitPicksPolicy(userId, picks, function(policyErr, policyRes) {
        if(policyErr) {
            console.error(policyErr);
            result(policyErr, null);
        }

        Pick.addPicksSQL(picks, function(addErr, addRes) {
            if(addErr) {
                console.error(addErr);
                result(addErr, null);
            }
            Pick.getCurrentPicks(token, function(currentErr, currentRes) {
                if(currentErr) {
                    console.error(currentErr);
                    result(currentErr, null);
                }   
                result(null, currentRes);
            });
        });
    });
} 

Pick.addPicksSQL = function addPicksSQL(picks, result) {

    let keys = ['pick_id','user_id','game_id','team_id', 'submitted_date'];
    let values = picks.map( obj => keys.map( key => obj[key]));
    let query = 'INSERT INTO picks (' + keys.join(',') + ') VALUES ? as INS ' + 
        'ON DUPLICATE KEY UPDATE ' + 
        'pick_id = INS.pick_id, ' + 
        'user_id = INS.user_id, ' +
        'game_id = INS.game_id, ' +
        'team_id = INS.team_id, ' +
        'submitted_date = INS.submitted_date';
    var sql = mysql.createConnection(config);

    sql.connect(function(connectErr){
        if (connectErr) {
            console.log(connectErr);
            result(connectErr, null);
        }
        sql.query(query, [values], function(err, res) {
            sql.destroy();
            if(err) {
                console.log(err);
                result(null, err);
            }
            else {
                console.log(res)
                result(null, { message: "SUCCESS", result: res.insertId });
            }
        });
    });
}

Pick.deletePick = function deletePick(picks, token, result) {
    Pick.editPicksPolicy(picks, function(policyErr, policyRes) {
        if(policyErr) {
            console.error(policyErr);
            result(policyErr, null);
        }
        var sql = mysql.createConnection(config);

        sql.connect(function(connectErr) {
            if(connectErr) {
                console.error(connectErr);
                result(connectErr, null);
            }

            sql.query("DELETE FROM picks WHERE pick_id in (?)", [picks], function(err, res) {
                sql.destroy();
                if(err) {
                    console.error(err);
                    result(err, null);
                }

                Pick.getCurrentPicks(token, function(currentErr, currentRes) {
                    if(currentErr) {
                        console.error(currentErr);
                        result(currentErr, null);
                    }   
                    result(null, currentRes);
                });
            })
        });
    });
}

Pick.updatePicks = function updatePicks(picks, token, result) {
    Pick.editPicksPolicy(picks, function(policyErr, policyRes) {
        if(policyErr) {
            console.error(policyErr);
            result(policyErr, null);
        }
        Pick.addPicks(picks, function(addErr, addRes){
            if(addErr) {
                console.error(addErr);
                result(addErr, null);
            }
            Pick.getCurrentPicks(token, function(currentErr, currentRes) {
                if(currentErr) {
                    console.error(currentErr);
                    result(currentErr, null);
                }   
                result(null, currentRes);
            });
        })
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

Pick.editPicksPolicy = function editPicksPolicy (picks, result) {
    if(picks.length === 0) {
        result({status: 'ERROR', message: 'NO_PICKS'}, null);
    }

    if(picks.find((pick) => new Date(pick.pick_submit_by_date) < new Date())) {
        result({status: 'ERROR', message: 'PASS_SUBMIT_DATE'}, null);
    } else {
        result(null, {status: 'SUCCESS'})
    }
}

Pick.submitPicksPolicy = function submitPicksPolicy (userId, picks, result) {
    if(picks.length === 0) {
        result({status: 'ERROR', message: 'NO_PICKS'}, null);
    }

    this.getDetailedUserInfo(userId, function(detailErr, detailObj) {
        if(detailErr) {
            console.error(detailErr);
            result(detailErr, null);
        }

        let totalPicks = picks.length + detailObj.pending_picks + detailObj.picks;

        if(picks.find((pick) => new Date(pick.pick_submit_by_date) < new Date())) {
            result({status: 'ERROR', message: 'PASS_SUBMIT_DATE'}, null);
        } else if(totalPicks >= detailObj.max_picks) {
            result({
                status: 'ERROR', 
                message: 'TOO_MANY_PICKS', 
                data: { 
                    limit: detailObj.max_picks, 
                    over: (totalPicks - detailObj.max_picks)
                }
            }, null)
        } else {
            result(null, {status: 'SUCCESS'})
        }
    });
}

Pick.getDetailedUserInfo = function getDetailedUserInfo(userId, result) {
    var sql  = mysql.createConnection(config);

    sql.connect(function(connectErr) {
        if(connectErr) {
            console.error(connectErr);
            result(err, null);
        }
        sql.query('SELECT s.user_id, s.user_type, s.max_picks, s.picks_penalty, r.pending_picks, r.picks ' +
            'FROM season_users s, config c, rpt_user_stats r ' + 
            'WHERE c.status = \'active\' ' +   
            'AND s.season = JSON_VALUE(c.settings, \'$.currentSeason\') ' +
            'AND s.season_type = JSON_VALUE(c.settings, \'$.currentSeasonType\') ' +
            'AND r.season = JSON_VALUE(c.settings, \'$.currentSeason\') ' +
            'AND r.season_type = JSON_VALUE(c.settings, \'$.currentSeasonType\') ' +
            'AND s.user_id = ? ' +
            'AND r.user_id = ?',
            [userId, userId],
            function(err, res) {
                sql.destroy();
                if(err) {
                    console.error(err);
                    result(err, null);
                } else {
                    console.log(res);
                    result(null, res);
                }
            }
        )
    });
}



module.exports = Pick;

