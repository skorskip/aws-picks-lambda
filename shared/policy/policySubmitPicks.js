'use strict'
var fetch = require('../db/fetch');

const query = 'SELECT s.user_type, s.max_picks, COUNT(p.pick_id) as picks ' +
    'FROM season_users s, config c, picks p, games g ' + 
    'WHERE c.status = \'active\' ' +   
    'AND s.season = JSON_VALUE(c.settings, \'$.currentSeason\') ' +
    'AND s.season_type = JSON_VALUE(c.settings, \'$.currentSeasonType\') ' +
    'AND g.season = JSON_VALUE(c.settings, \'$.currentSeason\') ' +
    'AND g.season_type = JSON_VALUE(c.settings, \'$.currentSeasonType\') ' +
    'AND g.game_id = p.game_id ' + 
    'AND (g.winning_team_id is not null OR g.game_status <> \'COMPLETED\') ' +
    'AND s.user_id = ? ' +
    'AND p.user_id = ?';

var messageEnum = {
    PASS_SUBMIT_DATE: 'PASS_SUBMIT_DATE',
    TOO_MANY_PICKS: 'TOO_MANY_PICKS',
    NO_PICKS: 'NO_PICKS',
    NOT_ALLOWED: 'NOT_ALLOWED'
}

var statusEnum = {
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR'
}
var UserDetail = function(userDetail) {
    this.user_type = userDetail.user_type;
    this.max_picks = userDetail.max_picks;
    this.picks = userDetail.picks;
}

var PolicySubmitPicks = function() {}

PolicySubmitPicks.policy = async function policy(userId, games) {
    if(games.length === 0) {
        throw {status: statusEnum.ERROR, message: messageEnum.NO_PICKS};
    }

    var detailObj = await this.getDetailedUserInfo(userId);
    var userInfo = new UserDetail(detailObj);
    var totalPicks = games.length + userInfo.picks;

    if(games.find((game) => new Date(game.pick_submit_by_date) < new Date())) {
        throw {status: statusEnum.ERROR, message: messageEnum.PASS_SUBMIT_DATE};
    } else if(totalPicks > userInfo.max_picks){
        throw {
            status: statusEnum.ERROR, 
            message: messageEnum.TOO_MANY_PICKS, 
            data: { 
                limit: userInfo.max_picks, 
                over: (totalPicks - userInfo.max_picks)
            }
        };
    } else if(userInfo.user_type != "participant") { 
        throw {status: statusEnum.ERROR, message: messageEnum.NOT_ALLOWED};
    } else {
        return {status: statusEnum.SUCCESS};
    }
}

PolicySubmitPicks.getDetailedUserInfo = async function getDetailedUserInfo(userId) {
    var res = await fetch.query(query,[userId, userId]);
    return res[0];
}

module.exports = PolicySubmitPicks;