'use strict'
var jwtDecode = require('jwt-decode');
var shared = require('picks-app-shared');
var queries = require('../utils/queries');

var Pick = function(pick) {
    this.game_id                = pick.game_id;
    this.team_id                = pick.team_id;
    this.user_id                = pick.user_id;
    this.submitted_date         = pick.submitted_date;
    this.pick_submit_by_date    = pick.pick_submit_by_date;
}

Pick.getCurrentPicks = async function getCurrentPicks(token) {
    var userToken = jwtDecode(token)
    var username = userToken['cognito:username'];
    return await shared.fetch(queries.GET_CURRENT_PICKS, [username]);
}

Pick.addPicks = async function addPicks(userId, picks, token) {
    var games = await shared.game(picks.map(pick => pick.game_id));
    await shared.policySubmitPicks(userId, games);
    await Pick.addPicksSQL(picks);
    return await Pick.getCurrentPicks(token);
} 

Pick.addPicksSQL = async function addPicksSQL(picks) {
    let keys = ['pick_id','user_id','game_id','team_id', 'submitted_date'];
    let values = picks.map( obj => keys.map( key => obj[key]));
    let query = queries.ADD_PICKS.replace("$VALUES", keys.join(','));
    return await shared.fetch(query, [values]);
}

Pick.deletePick = async function deletePick(picks, token) {
    var games = await shared.game(picks.map(pick => pick.game_id));
    await shared.policyEditPicks(games);
    await shared.fetch(queries.DELETE_PICKS, [picks]);
    return await Pick.getCurrentPicks(token);
}

Pick.updatePicks = async function updatePicks(picks, token) {
    var games = await shared.game(picks.map(pick => pick.game_id));
    await shared.policyEditPicks(games);
    await Pick.addPicksSQL(picks);
    return await this.getCurrentPicks(token);
}

module.exports = Pick;

