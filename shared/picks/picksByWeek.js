'use strict';
var jwtDecode = require('jwt-decode');
var fetch = require('../db/fetch');

const query = "SELECT p.pick_id, p.game_id, p.team_id, p.user_id, g.away_team_id, g.home_team_id, g.pick_submit_by_date " +
    "FROM picks p, games g, users u " + 
    "WHERE p.game_id = g.game_id " + 
    "AND g.season = ? " + 
    "AND g.week = ? " +
    "AND g.season_type = ? " +
    "AND u.user_id = p.user_id " +
    "AND u.user_name = ? " +
    "ORDER BY g.start_time ASC"

var PicksByWeek = function(picksByWeek) {
    this.pick_id = picksByWeek.pick_id
    this.user_id = picksByWeek.user_id
    this.game_id = picksByWeek.game_id;
    this.team_id = picksByWeek.team_id;
    this.submitted_date = picksByWeek.submitted_date;
    this.pick_submit_by_date = picksByWeek.pick_submit_by_date;
}

PicksByWeek.getPicksByWeek = async function getPicksByWeek(season, seasonType, week, token) {
    var userToken = jwtDecode(token)
    var username = userToken['cognito:username'];
    let res = await fetch.query(query, [season, week, seasonType, username]);
    return res;
}

module.exports = PicksByWeek;