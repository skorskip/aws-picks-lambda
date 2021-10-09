'use strict'
var mysql = require('mysql');
var config = require('../utils/db');
var shared = require('picks-app-shared');

const gameSort = (a, b) => {
    if(a.game_id > b.game_id) return 1;
    if(b.game_id > a.game_id) return -1;
    return 0;
}

var PicksUser = function(game, homeTeam, awayTeam, pick, winning_team_id, game_status, pick_submit_by_date) {
    this.game = game;
    this.awayTeam = awayTeam;
    this.homeTeam = homeTeam;
    this.pick = pick;
    this.winning_team_id = winning_team_id;
    this.game_status = game_status;
    this.pick_submit_by_date = pick_submit_by_date;
}

PicksUser.getUsersPicksByWeek = function getUsersPicksByWeek(userId, season, week, seasonType, result) {
    var sql = mysql.createConnection(config);

    sql.connect(function(connectErr){
        if (connectErr) {
            console.log(connectErr);
            result(connectErr, null);
        }
        sql.query(queries.GET_USER_PICKS_BY_WEEK, 
            [season, week, seasonType, userId, new Date()], 
            function(err, res){
            sql.destroy();
            if(err) {
                console.log(err);
                result(err, null);
            }
            else {
                PicksUser.picksObjectMapper(res, function(mappingErr, picksObject){
                    PicksUser.pickUserMapper(picksObject, function(userMappingErr, picksUserObject){
                        console.log(picksUserObject);
                        result(null, picksUserObject);
                    })

                });
            }
        });
    });
}

PicksUser.picksObjectMapper = function picksObjectMapper(picks, result) {

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

PicksUser.pickUserMapper = function pickUserMapper(pickUsers, result) {
    const picks = pickUsers.picks;
    const teams = pickUsers.teams;
    const games = pickUsers.games;

    picks.sort(gameSort);
    games.sort(gameSort);

    const picksList = [];

    games.forEach((game, i) => {
        var picksUser = new PicksUser(
            game,
            teams.find(team => team.team_id === game.away_team_id),
            teams.find(team => team.team_id === game.home_team_id),
            picks[i],
            game.winning_team_id,
            game.game_status

        );
        picksList.push(picksUser);
    });

    result(null, picksList);
}

module.exports = PicksUser;