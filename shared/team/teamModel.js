'user strict';
var fetch = require('../db/fetch');

const query = "SELECT * FROM teams WHERE team_id in (?)";

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
        fetch.query(query, [teamIds], function(err, res){
            if(err) result(err, null);
            result(null, res);
        });
    } else {
        console.log("[]");
        result(null, []);
    }
}

module.exports= Team;