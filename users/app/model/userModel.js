'use strict';
var jwtDecode = require('jwt-decode');
var queries = require('../utils/queries');
var shared = require('picks-app-shared');

var CurrentSeasonData = function(currSeasonData) {
    this.max_picks      = currSeasonData.max_picks == null ? 0 : currSeasonData.max_picks;
    this.picks_penalty  = currSeasonData.picks_penalty == null ? 0 : currSeasonData.picks_penalty;
    this.pending_picks  = currSeasonData.pending_picks == null ? 0 : currSeasonData.pending_picks;
    this.picks          = currSeasonData.picks == null ? 0 : currSeasonData.picks;
    this.ranking        = currSeasonData.ranking == null ? 0 : currSeasonData.ranking;
    this.wins           = currSeasonData.wins == null ? 0 : currSeasonData.wins;
    this.win_pct        = currSeasonData.win_pct == null ? 0 : currSeasonData.win_pct;
    this.prev_ranking   = currSeasonData.prev_ranking == null ? 0 : currSeasonData.prev_ranking;
    this.bonus_nbr      = currSeasonData.bonus_nbr == null ? 0 : currSeasonData.bonus_nbr;
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

var StatusEnum = {
    FAILURE : "FAILURE",
    SUCCESS : "SUCCESS",
    UNAUTHORIZED : "UNAUTHORIZED",
    COGNITO_USER : "cognito:username"
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
    var fullUsers = [];
    
    allUsers.forEach(user => {
        var userDetail = details[0].find(detail => detail.user_id == user.user_id);
        fullUsers.push(new User(user, userDetail));  
    });
    
    return fullUsers;
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

module.exports = User;