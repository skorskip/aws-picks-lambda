'use strict'

var League = require('./league/leagueModel');
var Team = require('./team/teamModel');
var Game = require('./game/gameModel');
var PolicySubmitPicks = require('./policy/policySubmitPicks');
var PolicyEditPicks = require('./policy/policyEditPicks');
var PicksByWeek = require('./picks/picksByWeek');
const UserPicksByWeek = require('./picks/userPicksByWeek');

exports.league = function(dbConfig, result) {
    League.leagueSettings(dbConfig, function(err, res) {
        if(err) result(err, null);
        result(null, res);
    });
};

exports.team  = function(teamIds, dbConfig, result) {
    Team.getTeamsById(teamIds, dbConfig, function(err, res) {
        if(err) result(err, null);
        result(null, res);
    });
 };
 
 exports.game = function(gameIds, dbConfig, result) {
     Game.getGamesById(gameIds, dbConfig, function(err, res) {
         if(err) result(err, null);
         result(null, res);
     });
 };

 exports.policySubmitPicks = function(userId, picks, dbConfig, result) {
     PolicySubmitPicks.policy(userId, picks, dbConfig, function(err, res) {
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

 exports.picksByWeek = function(season, seasonType, week, token, dbConfig, result) {
    PicksByWeek.getPicksByWeek(season, seasonType, week, token, dbConfig, function(err, res) {
        if(err) result(err, null);
        result(null, res);
    });
 };

 exports.userPicksByWeek = function(season, seasonType, week, dbConfig, result) {
     UserPicksByWeek.getUserPicksByWeek(season, seasonType, week, dbConfig, function(err, res) {
         if(err) result(err, null);
         result(null, res);
     });
 };