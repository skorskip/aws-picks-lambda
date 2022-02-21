var queries = {

    UPDATE_USER : 'UPDATE users SET ' +
    'user_name = ?, ' + 
    'first_name = ?, ' +
    'last_name = ?, ' +
    'email = ?, ' +
    'password = sha2(concat(password_salt,?),256) ' +
    'WHERE user_id = ?',

    DELETE_USER : 'DELETE FROM users WHERE user_id = ?',

    CREATE_USER : 'INSERT INTO users SET ?',

    LOGIN_USER : 'SELECT * ' +
    'FROM users ' +
    'WHERE (LOWER(user_name) = ?)',

    ALL_USERS : 'SELECT * ' + 
    'FROM users',

    USER_DETAILS : 'SELECT s.max_picks, s.picks_penalty, r.pending_picks, r.picks,  r.ranking, r.wins, r.win_pct ' +
    'FROM season_users s, config c, rpt_user_stats r ' + 
    'WHERE c.status = \'active\' ' +   
    'AND s.season = JSON_VALUE(c.settings, \'$.currentSeason\') ' +
    'AND s.season_type = JSON_VALUE(c.settings, \'$.currentSeasonType\') ' +
    'AND r.season = JSON_VALUE(c.settings, \'$.currentSeason\') ' +
    'AND r.season_type = JSON_VALUE(c.settings, \'$.currentSeasonType\') ' +
    'AND s.user_id = ? ' +
    'AND r.user_id = ?',

    UPDATE_STAT_VIEW : 'CALL update_weekly_user_stats(?, ?, ?)',

    USER_STANDINGS : 'CALL get_user_standings(?,?,?)',

    USER_UPDATE_IMG : 'UPDATE users SET ' +
    'slack_user_image = ? ' +
    'WHERE user_id = ?'
}

module.exports = queries;