'use strict'

var mysql = require('mysql');

var UserPicksByWeek = function(userPicksByWeek){
    this.pick_id                = userPicksByWeek.pick_id;                  
    this.game_id                = userPicksByWeek.game_id;                 
    this.team_id                = userPicksByWeek.team_id;                
    this.user_id                = userPicksByWeek.user_id;                
    this.user_inits             = userPicksByWeek.user_inits;           
    this.first_name             = userPicksByWeek.first_name;               
    this.last_name              = userPicksByWeek.last_name;                
    this.pick_submit_by_date    = userPicksByWeek.pick_submit_by_date;     
};

UserPicksByWeek.getUserPicksByWeek = function getWeekPicksByGame(season, seasonType, week, dbConfig, result) {
    var sql = mysql.createConnection(dbConfig);

    sql.connect(function(connectErr){
        if (connectErr) {
            console.error(connectErr);
            result(connectErr, null);
        }
        sql.query(
            "SELECT p.pick_id, p.game_id, p.team_id, p.user_id, u.user_inits, u.first_name, u.last_name, g.pick_submit_by_date " +
            "FROM picks p, users u, games g " + 
            "WHERE p.user_id = u.user_id " + 
            "AND g.week = ? " + 
            "AND g.season = ? " +
            "AND g.season_type = ? " +
            "AND g.game_id = p.game_id " +
            "AND g.pick_submit_by_date < ? order by u.first_name, u.last_name", 
            [week, season, seasonType, new Date()], function(err, res) {
            sql.destroy();
            if(err) {
                console.error(err);
                result(err, null);
            }
            result(null, res);
        });
    });
}

module.exports = UserPicksByWeek;