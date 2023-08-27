'use strict'

var League = require('./league/leagueModel');
var Team = require('./team/teamModel');
var Game = require('./game/gameModel');
var PolicySubmitPicks = require('./policy/policySubmitPicks');
var PolicyEditPicks = require('./policy/policyEditPicks');
var PolicyDeleteWeek = require('./policy/policyDeleteWeek');
var PicksByWeek = require('./picks/picksByWeek');
var UserPicksByWeek = require('./picks/userPicksByWeek');
var Fetch = require('./db/fetch');
var Slack = require('./slack/slackProfile');

exports.league = async function() {
    var res = await League.leagueSettings();
    return res;
};

exports.team  = async function(teamIds) {
    var res = await Team.getTeamsById(teamIds);
    return res;
 };
 
 exports.game = async function(gameIds) {
     var res = await Game.getGamesById(gameIds);
    return res;
 };

 exports.policyDeleteWeek = async function(userId, token) {
    var res = await PolicyDeleteWeek.policy(userId, token);
    return res;
 }

 exports.policySubmitPicks = async function(userId, picks) {
     var res = PolicySubmitPicks.policy(userId, picks);
     return res;
 };

 exports.policyEditPicks = async function(picks) {
    var res = await PolicyEditPicks.policy(picks);
    return res;
 };

 exports.picksByWeek = async function(season, seasonType, week, token) {
    var res = PicksByWeek.getPicksByWeek(season, seasonType, week, token);
    return res;
 };

 exports.userPicksByWeek = async function(season, seasonType, week) {
     var res = await UserPicksByWeek.getUserPicksByWeek(season, seasonType, week);
     return res;
 };

 exports.slackProfile = async function(userId) {
    var res = await Slack.slackProfile(userId);
    return res;
 }

 exports.slackProfileByEmail = async function(email) {
    var res = await Slack.slackProfileByEmail(email);
    return res;
 }

 exports.fetch = async function(query, params) {
     var res = await Fetch.query(query, params);
     return res;
 }