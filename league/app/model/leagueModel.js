'use strict'
var mysql = require('mysql');
var config = require('./db');
var League = function(){}

League.leagueSettings = function leagueSettings(result){
    
    var sql = mysql.createConnection(config);
    
    sql.connect(function(err){
        if (err) {
            console.log(err);
            result(err, null);
        }
        sql.query(
            'SELECT settings ' +
            'FROM config ' +
            'WHERE status = "active"', [], function(err, res){
                sql.destroy();
                if(err) {
                    console.log(err);
                    result(err, null);
                }
                else {
                    console.log(JSON.parse(res[0].settings));
                    result(null, JSON.parse(res[0].settings));
                }
        });
    });


};

module.exports = League;