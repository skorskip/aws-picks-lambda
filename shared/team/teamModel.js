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

Team.getTeamsById = async function getTeamsById(teamIds) {

    if(teamIds.length > 0) {
        let res = await fetch.query(query, [teamIds]);
        return res;
    } else {
        return [];
    }
}

module.exports= Team;