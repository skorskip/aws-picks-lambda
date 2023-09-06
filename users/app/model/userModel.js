'use strict';
var jwtDecode = require('jwt-decode');
var queries = require('../utils/queries');
var shared = require('picks-app-shared');

var StatusEnum = {
    FAILURE : "FAILURE",
    SUCCESS : "SUCCESS",
    UNAUTHORIZED : "UNAUTHORIZED",
    COGNITO_USER : "cognito:username"
}

var BonusStatusEnum = {
    GAME_IN_PROGRESS: "GIP",
    DISQUALIFIED: "DQ",
    NOT_QUALIFY: "DNQ",
    QUALIFIED: "QUAL",
    WON: "WON",
    QUALIFY_IN_PROGRESS: "QIP"
}

var CurrentSeasonData = function(currSeasonData) {
    this.max_picks      = currSeasonData.max_picks == null ? 0 : parseInt(currSeasonData.max_picks);
    this.picks_penalty  = currSeasonData.picks_penalty == null ? 0 : parseInt(currSeasonData.picks_penalty);
    this.pending_picks  = currSeasonData.pending_picks == null ? 0 : parseInt(currSeasonData.pending_picks);
    this.picks          = currSeasonData.picks == null ? 0 : parseInt(currSeasonData.picks);
    this.ranking        = currSeasonData.ranking == null ? 0 : parseInt(currSeasonData.ranking);
    this.wins           = currSeasonData.wins == null ? 0 : parseInt(currSeasonData.wins);
    this.win_pct        = currSeasonData.win_pct == null ? 0 : parseFloat(currSeasonData.win_pct);
    this.prev_ranking   = currSeasonData.prev_ranking == null ? 0 : parseInt(currSeasonData.prev_ranking);
    this.bonus_nbr      = currSeasonData.bonus_nbr == null ? 0 : parseInt(currSeasonData.bonus_nbr);
    this.dropped_week   = currSeasonData.dropped_week == null ? null : parseInt(currSeasonData.dropped_week);
    this.user_type      = currSeasonData.user_type;
}

var User = function(userInfo, userCurrSeasonData) {
    this.user_id = userInfo.user_id;
    this.user_name = userInfo.user_name;
    this.first_name = userInfo.first_name;
    this.last_name = userInfo.last_name;
    this.user_inits = userInfo.user_inits;
    this.email = userInfo.email;
    this.status = userInfo.status;
    this.type = userInfo.type;
    this.slack_user_id = userInfo.slack_user_id;
    this.slack_user_image = userInfo.slack_user_image;
    this.current_season_data = userCurrSeasonData == null ? null : new CurrentSeasonData(userCurrSeasonData);
}

User.updateUser = async function updateUser(userId, user) {
    var res = shared.fetch(queries.UPDATE_USER, [
        user.user_name,
        user.first_name,
        user.last_name,
        user.email,
        user.password, 
        userId]);

    if(res.affectedRows == 1) {
        return StatusEnum.SUCCESS;
    } else {
        throw StatusEnum.FAILURE;
    }
};

User.deleteUser = async function deleteUser(userId) {
    var res = await shared.fetch(queries.DELETE_USER, userId);
    return res;
};

User.createUser = async function createUser(user) {
    await shared.fetch(queries.CREATE_USER, user);
    return StatusEnum.SUCCESS
};

User.login = async function login(token) {
    var userToken = jwtDecode(token);
    var username = userToken[StatusEnum.COGNITO_USER];

    var users = await shared.fetch(queries.LOGIN_USER, [username.toLowerCase()]);

    if(users.length === 0) return StatusEnum.UNAUTHORIZED;

    var details = await User.getUserDetailsView(users[0].user_id);
    return new User(users[0], details[0]);
};

User.getAllUsers = async function getAllUsers(season, seasonType, week) {
    var allUsers = await shared.fetch(queries.ALL_USERS, []);
    var details = await User.getUserDetailsStorProc(season, seasonType, week);
    
    return details[0].map(d => {
        return new User(allUsers.find(u => u.user_id === d.user_id), d);
    });
};

User.updateView = async function updateView(season, seasonType, week) {
    var res = await shared.fetch(queries.UPDATE_STAT_VIEW, [season, seasonType, week]);
    return res;
};

User.getUserDetailsView = async function getUserDetails(userId) {
    var res = await shared.fetch(queries.USER_DETAILS,[userId, userId]);
    return res;
}

User.getUserDetailsStorProc = async function getUserDetailsStorProc(season, seasonType, week) {
    var res = await shared.fetch(queries.USER_STANDINGS, [season, seasonType, week]);
    return res;
}

User.updateUserImage = async function updateUserImage(token) {
    var userToken = jwtDecode(token);
    var username = userToken[StatusEnum.COGNITO_USER];

    var users = await shared.fetch(queries.LOGIN_USER, [username.toLowerCase()]);
    var slackProfile = await shared.slackProfile(users[0].slack_user_id);
    await shared.fetch(queries.USER_UPDATE_IMG, [slackProfile.imageURL, users[0].user_id]);
    return StatusEnum.SUCCESS;
}

User.addUserSlackId = async function addUserSlackId(request, token) {
    var userToken = jwtDecode(token);
    var username = userToken[StatusEnum.COGNITO_USER]; 
    var users = await shared.fetch(queries.LOGIN_USER, [username.toLowerCase()]);
    var slackId = await shared.slackProfileByEmail(request?.email);
    await shared.fetch(queries.USER_SLACK_ID, [slackId.userId, users[0].user_id]);
    return {slackId};
}

User.getBonusUsers = async function getBonusUsers(season, seasonType, week) {
    var bonusUsers = await shared.fetch(queries.GET_BONUS_USERS, [season, seasonType, week]);
    var users = bonusUsers[0].filter(
        user => (user.bonus_status !== BonusStatusEnum.DISQUALIFIED 
            && user.bonus_status !== BonusStatusEnum.NOT_QUALIFY
            && user.bonus_status !== BonusStatusEnum.GAME_IN_PROGRESS));
    var bonusUserList = await User.getUsersByIds(users.map(user => user.user_id));
    return bonusUserList?.map(u => ({...u, wins: (users?.find(ub => ub.user_id === u.user_id)?.wins || 0)}));
}

User.getUsersByIds = async function getUsersByIds(userIds) {
    if(userIds.length !== 0) {
        return await shared.fetch(queries.GET_USERS_BY_ID, [userIds]);
    }
    return [];
}

module.exports = User;