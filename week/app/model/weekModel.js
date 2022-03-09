'user strict'
var shared = require('picks-app-shared');
var queries = require('../utils/queries');

var Week = function(season, week, seasonType, games, picks, teams, userPicks){
    this.number = week;
    this.games = games;
    this.season = season;
    this.seasonType = seasonType;
    this.teams = teams;
    this.picks = picks;
    this.userPicks = userPicks
};

Week.getWeek = async function getWeek(season, week, seasonType, token){
    var games = await Week.getWeekSQL(season, week, seasonType);
    var picks = await shared.picksByWeek(season, seasonType, week, token);
    var userPicks = await shared.userPicksByWeek(season, seasonType, week);
    return await Week.weekMapper(games, picks, userPicks, season, week, seasonType);
}

Week.getWeekSQL = async function getWeekSQL(season, week, seasonType) {
    var week = await shared.fetch(queries.ALL_GAMES_BY_WEEK, [season, week, seasonType]);
    return week;
};

Week.weekMapper = async function(games, picks, userPicks, season, week, seasonType) {
    var teamIds = [];
    
    if(games.length > 0) {
        games.forEach(game => {
            teamIds.push(game.away_team_id);
            teamIds.push(game.home_team_id);
        });
    }

    var teams = await shared.team(teamIds);
    var response = new Week(season, week, seasonType, games, picks, teams, userPicks);
    return response;
};

module.exports= Week;