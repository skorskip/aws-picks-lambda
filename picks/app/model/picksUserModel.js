'use strict'

var shared = require('picks-app-shared');
var queries = require('../utils/queries');

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

PicksUser.getUsersPicksByWeek = async function getUsersPicksByWeek(userId, season, week, seasonType) {
    var data = await shared.fetch(queries.GET_USER_PICKS_BY_WEEK, 
        [season, week, seasonType, userId, new Date()]);
    var picksList = await PicksUser.picksObjectMapper(data);
    return PicksUser.pickUserMapper(picksList);
}

PicksUser.picksObjectMapper = async function picksObjectMapper(picks) {

    var teams = [];
    var games  = [];

    picks.forEach(pick => {
        games.push(pick.game_id);
        teams.push(pick.away_team_id);
        teams.push(pick.home_team_id);
    });

    var teamObjects = await shared.team(teams); 
    var gameObjects = await shared.game(games);

    var pickObject = {};
    pickObject.picks = picks;
    pickObject.teams = teamObjects;
    pickObject.games = gameObjects;

    return pickObject;
}

PicksUser.pickUserMapper = function pickUserMapper(pickUsers) {
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
    return picksList;
}

module.exports = PicksUser;