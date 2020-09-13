'user strict';
var mysql = require('mysql');
var config = require('./db');

var Team = function(team){
    this.team_city          = team.team_city;
    this.team_name          = team.team_name;
    this.abbreviation       = team.abbreviation;
    this.primary_color      = team.primary_color;
    this.secondary_color    = team.secondary_color;
    this.display_color      = team.display_color;
};

Team.getTeamsById = function getTeamsById(teamIds, result) {

    if(teamIds.length > 0) {
        var sql = mysql.createConnection(config.database);

        sql.connect(function(err){
            if(err) {
                console.log(err);
                result(err, null);
            }
            sql.query("SELECT * FROM teams WHERE team_id in (?)", [teamIds], function(err, res){
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
}

module.exports= Team;