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

Pick.getCurrentPicks = function getCurrentPicks(token, result) {
    var userToken = jwtDecode(token)
    var username = userToken['cognito:username'];

    shared.fetch(queries.GET_CURRENT_PICKS, [username], function(err, res) {
        if(err) return result(err, null);
        return result(null, res);
    });
}

Pick.addPicks = function addPicks(userId, picks, token, result) {
    shared.game(picks.map(pick => pick.game_id), function(gamesErr, games) {

        if(gamesErr) {
            console.error(gamesErr);
            return result(gamesErr, null);
        }

        shared.policySubmitPicks(userId, games, function(policyErr, policyRes) {
            if(policyErr) {
                console.error(policyErr);
                return result(policyErr, null);
            }
    
            Pick.addPicksSQL(picks, function(addErr, addRes) {
                if(addErr) {
                    console.error(addErr);
                    return result(addErr, null);
                }
                Pick.getCurrentPicks(token, function(currentErr, currentRes) {
                    if(currentErr) {
                        console.error(currentErr);
                        return result(currentErr, null);
                    }
                    return result(null, currentRes);
                });
            });
        });
    });
} 

Pick.addPicksSQL = function addPicksSQL(picks, result) {

    let keys = ['pick_id','user_id','game_id','team_id', 'submitted_date'];
    let values = picks.map( obj => keys.map( key => obj[key]));
    let query = queries.ADD_PICKS.replace("$VALUES", keys.join(','));

    shared.fetch(query, [values], function(err, res) {
        if(err) {
            console.error(err)
            return result(err, null);
        }
        return result(null, { message: "SUCCESS", result: res.insertId });
    });
}

Pick.deletePick = function deletePick(picks, token, result) {
    shared.policyEditPicks(picks, function(policyErr, policyRes) {
        if(policyErr) {
            console.error(policyErr);
            return result(policyErr, null);
        }

        shared.fetch(queries.DELETE_PICKS, [picks], function(err,res){
            if(err) {
                console.error(err);
                return result(err, null);
            }

            Pick.getCurrentPicks(token, function(currentErr, currentRes) {
                if(currentErr) {
                    console.error(currentErr);
                    return result(currentErr, null);
                }   
                return result(null, currentRes);
            });
        });
    });
}

Pick.updatePicks = function updatePicks(picks, token, result) {
    shared.policyEditPicks(picks, function(policyErr, policyRes) {
        if(policyErr) {
            console.error(policyErr);
            return result(policyErr, null);
        }
        Pick.addPicksSQL(picks, function(addErr, addRes){
            if(addErr) {
                console.error(addErr);
                return result(addErr, null);
            }
            Pick.getCurrentPicks(token, function(currentErr, currentRes) {
                if(currentErr) {
                    console.error(currentErr);
                    return result(currentErr, null);
                }   
                return result(null, currentRes);
            });
        })
    });
}

module.exports = Pick;

