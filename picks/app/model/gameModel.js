'user strict';
var mysql = require('mysql');
var config = require('./db');

var Game = function(game){
    this.game_id                    = game.game_id;
    this.season                     = game.season;
    this.week                       = game.week;
    this.season_game_nbr            = game.season_game_nbr;
    this.api_game_id                = game.api_game_id;
    this.start_time                 = game.start_time;
    this.away_team_id                  = game.away_team_id;
    this.home_team_id                  = game.home_team_id;
    this.home_spread                = game.home_spread;
    this.game_status                = game.game_status;
    this.away_team_score            = game.away_team_score;
    this.home_team_score            = game.home_team_score;
    this.winning_team_id               = game.winning_team_id;
    this.season_type                = game.season_type;
    this.pick_submit_by_date        = game.submit_by_date;
    this.current_quarter            = game.current_quarter;
    this.seconds_left_in_quarter    = game.seconds_left_in_quarter;
};

Game.getGamesById = function getGamesById(listGameIds, result) {
    if(listGameIds.length > 0) {
        var sql = mysql.createConnection(config.database);

        sql.connect(function(err){
            if(err) { 
                console.log(err);
                result(err, null);
            }

            sql.query("Select * from games where game_id in (?) ORDER BY start_time", [listGameIds], function (err, res) {
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
    } else {
        console.log("[]");
        result(null, []);
    }
};

module.exports= Game;