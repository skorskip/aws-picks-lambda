'use strict'
var sql = require('./db.js');

var League = function(){}

League.leagueSettings = function leagueSettings(result){
    sql.query(
        'SELECT settings ' +
        'FROM config ' +
        'WHERE status = "active"', [], function(err, res){
            if(err) {
                console.log(err);
                result(err, null);
            }
            else {
                console.log(JSON.parse(res[0].settings));
                result(null, JSON.parse(res[0].settings));
            }
    });
    sql.end();
};

module.exports = League;