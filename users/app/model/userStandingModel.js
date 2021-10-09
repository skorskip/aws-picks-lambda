'user strict'
var mysql = require('mysql');
var config = require('../utils/db');
const queries = require('../utils/queries');

var UserStanding = function(userStanding) {
    this.user_id = userStanding.user_id;
    this.ranking = userStanding.ranking;
    this.user_inits = userStanding.user_inits;
    this.user_name = userStanding.user_name;
    this.first_name = userStanding.first_name;
    this.last_name = userStanding.last_name;
    this.wins = userStanding.wins;
    this.picks = userStanding.picks;
    this.win_pct = userStanding.win_pct;
    this.pending_picks = userStanding.pending_picks;
    this.bonus_nbr = userStanding.bonus_nbr;
    this.prev_ranking = userStanding.prev_ranking;
    this.date = userStanding.date;
}

UserStanding.standings = function standings(season, seasonType, week, result) {
    var sql = mysql.createConnection(config);

    sql.connect(function(connectErr){
        if (connectErr) {
            console.error(connectErr);
            result(connectErr, null);
        }
        sql.query(queries.USER_STANDINGS, [season, seasonType, week], function(err, res) {
                sql.destroy();
                if(err) {
                    console.error(err);
                    result(err, null);
                }
                else {
                    console.log(res);
                    result(null, res[0]);
                }
            });
    });
};

module.exports = UserStanding;