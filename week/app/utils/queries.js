var queries = {
    ALL_GAMES_BY_WEELK : "SELECT * FROM games " +
        "WHERE season = ? " + 
        "AND week = ? " + 
        "AND season_type = ? " +
        "AND home_spread is not NULL " +
        "ORDER BY start_time"
}

module.exports = queries;