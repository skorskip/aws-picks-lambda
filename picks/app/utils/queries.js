var queries = {
    
    GET_CURRENT_PICKS : "SELECT p.pick_id, p.game_id, p.team_id, p.user_id, g.away_team_id, g.home_team_id, g.pick_submit_by_date " +
    "FROM picks p, games g, users u, config c " + 
    "WHERE p.game_id = g.game_id " +
    "AND c.status = \'active\' " +
    "AND g.season = JSON_VALUE(c.settings, \'$.currentSeason\') " + 
    "AND g.week = JSON_VALUE(c.settings, \'$.currentWeek\') " +
    "AND g.season_type = JSON_VALUE(c.settings, \'$.currentSeasonType\') " +
    "AND u.user_name = ? " +
    "AND p.user_id = u.user_id " +
    "ORDER BY g.start_time",

    ADD_PICKS : 'INSERT INTO picks ($VALUES) VALUES ? as INS ' + 
    'ON DUPLICATE KEY UPDATE ' + 
    'pick_id = INS.pick_id, ' + 
    'user_id = INS.user_id, ' +
    'game_id = INS.game_id, ' +
    'team_id = INS.team_id, ' +
    'submitted_date = INS.submitted_date',

    DELETE_PICKS : "DELETE FROM picks WHERE pick_id in (?)",

    GET_USER_PICKS_BY_WEEK : "SELECT p.pick_id, p.game_id, p.team_id, p.user_id, g.away_team_id, g.home_team_id, g.pick_submit_by_date, g.winning_team_id, g.game_status " +
    "FROM picks p, games g " + 
    "WHERE p.game_id = g.game_id " + 
    "AND g.season = ? " +
    "AND g.week = ? " + 
    "AND g.season_type = ? " +
    "AND p.user_id = ? " +
    "AND g.pick_submit_by_date < ? " +
    "ORDER BY g.start_time ASC"

}

module.exports = queries;