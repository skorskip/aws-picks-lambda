'use strict'

var League = require('./league/leagueModel');
var Team = require('./team/teamModel');
var Game = require('./game/gameModel');
var PolicySubmitPicks = require('./policy/policySubmitPicks');
var PolicyEditPicks = require('./policy/policyEditPicks');
var PicksByWeek = require('./picks/picksByWeek');
var UserPicksByWeek = require('./picks/userPicksByWeek');
var Fetch = require('./db/fetch');

exports.league = function(result) {
    League.leagueSettings(function(err, res) {
        if(err) result(err, null);
        result(null, res);
    });
};

exports.team  = function(teamIds, result) {
    Team.getTeamsById(teamIds, function(err, res) {
        if(err) result(err, null);
        result(null, res);
    });
 };
 
 exports.game = function(gameIds, result) {
     Game.getGamesById(gameIds, function(err, res) {
         if(err) result(err, null);
         result(null, res);
     });
 };

 exports.policySubmitPicks = function(userId, picks, result) {
     PolicySubmitPicks.policy(userId, picks, function(err, res) {
        if(err) result(err, null);
        result(null, res);
     });
 };

 exports.policyEditPicks = function(picks, result) {
     PolicyEditPicks.policy(picks, function(err, res) {
         if(err) result(err, res);
         result(null, res);
     });
 };

 exports.picksByWeek = function(season, seasonType, week, token, result) {
    PicksByWeek.getPicksByWeek(season, seasonType, week, token, function(err, res) {
        if(err) result(err, null);
        result(null, res);
    });
 };

 exports.userPicksByWeek = function(season, seasonType, week, result) {
     UserPicksByWeek.getUserPicksByWeek(season, seasonType, week, function(err, res) {
         if(err) result(err, null);
         result(null, res);
     });
 };

 exports.fetch = function(query, params, result) {
     Fetch.query(query, params, function(err, res) {
         if(err) result(err, null);
         result(null, res);
     })
 }