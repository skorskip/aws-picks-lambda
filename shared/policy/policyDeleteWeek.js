'use strict'
var fetch = require('../db/fetch');

const queryMulligan = 'SELECT u.id ' +
'FROM season_users s, config c ' + 
'WHERE c.status =\'active\' ' +
'AND s.season = JSON_VALUE(c.settings, \'$.currentSeason\') ' +
'AND s.season_type = JSON_VALUE(c.settings, \'$.currentSeasonType\') ' +
'AND s.dropped_week = NULL ' +
'AND s.user_id = ?';

const queryGamesOver = 'SELECT g.game_id ' +
'FROM config c, games g' + 
'WHERE c.status = \'active\' ' +   
'AND g.season = JSON_VALUE(c.settings, \'$.currentSeason\') ' +
'AND g.season_type = JSON_VALUE(c.settings, \'$.currentSeasonType\') ' +
'AND g.week = JSON_VALUE(c.settings, \'$.currentWeek\') ' +
'AND g.game_status <> \'COMPLETED\'';

const queryUserCheck = 'SELECT u.user_id ' +
'FROM users u ' + 
'WHERE u.username = ? ' +
'AND u.user_id = ?';

var statusEnum = {
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR'
}

var messageEnum = {
    NOT_ALLOWED: 'NOT_ALLOWED'
}

var PolicyDeleteWeek = function() {}

PolicyDeleteWeek.policy = async function policy (userId, token) {
    var userToken = jwtDecode(token)
    var username = userToken['cognito:username'];

    const userCheck = await fetch(queryUserCheck, [username, userId])
    const mulligan = await fetch(queryMulligan, [userId]);
    const gamesOver = await fetch(queryGamesOver);

    if (userCheck.length !== 0 && mulligan.length !== 0 && gamesOver.length !== 0) {
        return {status: statusEnum.SUCCESS}
    }

    throw {status: statusEnum.ERROR, message: messageEnum.NOT_ALLOWED}

}

module.exports = PolicyDeleteWeek;