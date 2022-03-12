'use strict'

var messageEnum = {
    PASS_SUBMIT_DATE: 'PASS_SUBMIT_DATE',
    NO_PICKS: 'NO_PICKS'
}

var statusEnum = {
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR'
}

var PolicyEditPicks = function(){};

PolicyEditPicks.policy = function policy (picks, result) {
    if(picks.length === 0) {
        result({status: statusEnum.ERROR, message: messageEnum.NO_PICKS}, null);
    }

    if(picks.find((pick) => new Date(pick.pick_submit_by_date) < new Date())) {
        result({status: statusEnum.ERROR, message: messageEnum.PASS_SUBMIT_DATE}, null);
    } else {
        result(null, {status: statusEnum.SUCCESS})
    }
}

module.exports = PolicyEditPicks;