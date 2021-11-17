'use strict'
var fetch = require('../db/fetch');

const query = 'SELECT s.user_type, s.max_picks, r.pending_picks, r.picks ' +
    'FROM season_users s, config c, rpt_user_stats r ' + 
    'WHERE c.status = \'active\' ' +   
    'AND s.season = JSON_VALUE(c.settings, \'$.currentSeason\') ' +
    'AND s.season_type = JSON_VALUE(c.settings, \'$.currentSeasonType\') ' +
    'AND r.season = JSON_VALUE(c.settings, \'$.currentSeason\') ' +
    'AND r.season_type = JSON_VALUE(c.settings, \'$.currentSeasonType\') ' +
    'AND s.user_id = ? ' +
    'AND r.user_id = ?';

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

var PolicySubmitPicks = function() {}

PolicySubmitPicks.policy = function policy(userId, picks, result) {
    if(picks.length === 0) {
        result({status: statusEnum.ERROR, message: messageEnum.NO_PICKS}, null);
    }

    this.getDetailedUserInfo(userId, function(detailErr, detailObj) {
        if(detailErr) {
            console.error(detailErr);
            result(detailErr, null);
        }

        let totalPicks = picks.length + detailObj.pending_picks + detailObj.picks;

        if(picks.find((pick) => new Date(pick.pick_submit_by_date) < new Date())) {
            result({status: statusEnum.ERROR, message: messageEnum.PASS_SUBMIT_DATE}, null);
        } else if(totalPicks >= detailObj.max_picks){
            result({
                status: statusEnum.ERROR, 
                message: messageEnum.TOO_MANY_PICKS, 
                data: { 
                    limit: detailObj.max_picks, 
                    over: (totalPicks - detailObj.max_picks)
                }
            }, null)
        } else if(detailObj.user_type != "participant") { 
            result({status: statusEnum.ERROR, message: messageEnum.NOT_ALLOWED}, null);
        } else {
            result(null, {status: statusEnum.SUCCESS})
        }
    });
}

PolicySubmitPicks.getDetailedUserInfo = function getDetailedUserInfo(userId, result) {
    fetch.query(query,[userId, userId], function(err, res) {
        if(err) result(err, null);
        result(null, res);
    });
}

module.exports = PolicySubmitPicks;