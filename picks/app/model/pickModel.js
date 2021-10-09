'use strict'
var mysql = require('mysql');
var config = require('../utils/db');
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
    var sql = mysql.createConnection(config);
    var username = userToken['cognito:username'];

    sql.connect(function(connectErr){
        if (connectErr) {
            console.log(connectErr);
            result(connectErr, null);
        }
        sql.query(queries.GET_CURRENT_PICKS, [username], function(err, res) {
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
    let query = queries.ADD_PICKS.replace("$VALUES", keys.join(','));
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

            sql.query(queries.DELETE_PICKS, [picks], function(err, res) {
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

module.exports = Pick;

