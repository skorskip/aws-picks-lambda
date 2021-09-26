'use strict'
var mysql = require('mysql');
var config = require('./db');
var jwtDecode = require('jwt-decode');
var shared = require('picks-app-shared');

var Pick = function(pick) {
    this.game_id                = pick.game_id;
    this.team_id                = pick.team_id;
    this.user_id                = pick.user_id;
    this.submitted_date         = pick.submitted_date;
    this.pick_submit_by_date    = pick.pick_submit_by_date;
}

const gameSort = (a, b) => {
    if(a.game_id > b.game_id) return 1;
    if(b.game_id > a.game_id) return -1;
    return 0;
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
                    Pick.pickUserMapper(picksObject, function(userMappingErr, picksUserObject){
                        console.log(picksUserObject);
                        result(null, picksUserObject);
                    })

                });
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
                console.log(res);
                result(null, res);
            }
        });
    });
}

Pick.addPicks = function addPicks(userId, picks, token, result) {
    shared.policySubmitPicks(userId, picks, config, function(policyErr, policyRes) {
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
    shared.policyEditPicks(picks, function(policyErr, policyRes) {
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
    shared.policyEditPicks(picks, function(policyErr, policyRes) {
        if(policyErr) {
            console.error(policyErr);
            result(policyErr, null);
        }
        Pick.addPicksSQL(picks, function(addErr, addRes){
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

    shared.team(teams, config, function(err, teamObjects){
        if(err){}
        pickObject.teams = teamObjects;
        shared.game(games, config, function(err, gameObjects){
            if(err){}
            pickObject.games = gameObjects;
            result(null, pickObject);
        });
    });    
}

Pick.pickUserMapper = function pickUserMapper(pickUsers, result) {
    const picks = pickUsers.picks;
    const teams = pickUsers.teams;
    const games = pickUsers.games;

    picks.sort(gameSort);
    games.sort(gameSort);

    const picksList = [];

    games.forEach((game, i) => {
        const gameObject = {
            game: game,
            awayTeam: teams.find(team => team.team_id === game.away_team_id),
            homeTeam: teams.find(team => team.team_id === game.home_team_id),
            pick: picks[i],
            winning_team_id: game.winning_team_id,
            game_status: game.game_status 
        }

        picksList.push(gameObject);
    });

    result(null, picksList);
}

module.exports = Pick;

