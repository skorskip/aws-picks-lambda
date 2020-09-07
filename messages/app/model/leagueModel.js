'use strict'
var sql = require('./db.js');

var League = function(){}

League.leagueSettings = function leagueSettings(result){
    sql.query(
        'SELECT settings ' +
        'FROM config ' +
        'WHERE status = "active"', [], function(err, res){
            if(err) result(err, null);
            else result(null, JSON.parse(res[0].settings));
    });
};

module.exports = League;