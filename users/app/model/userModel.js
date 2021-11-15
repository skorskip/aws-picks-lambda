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

User.updateUser = function updateUser(userId, user, result) {
    shared.fetch(queries.UPDATE_USER, [
        user.user_name,
        user.first_name,
        user.last_name,
        user.email,
        user.password, 
        userId], function(err, res){
        if(err) {
            console.error("FAILURE");
            result(null, 'FAILURE');
        }
        else {
            if(res.affectedRows == 1) {
                console.log("SUCCESS");
                result(null, 'SUCCESS');
            } else {
                console.log("SUCCESS");
                result(null, 'FAILURE')
            }
        }
    });
};

User.deleteUser = function deleteUser(userId, result) {
    shared.fetch(queries.DELETE_USER, userId, function(err, res) {
        if(err) {
            console.error(err);
            result(err, null);
        }
        else {
            console.log(res);
            result(null, res);
        }
    });
};

User.createUser = function createUser(user, result) {
    shared.fetch(queries.CREATE_USER, user, function(err, res) {
        if(err) {
            console.error('FAILURE');
            result(null, 'FAILURE');
        }
        else {
            console.log("SUCCESS");
            result(null, 'SUCCESS');
        }
    });
};

User.login = function login(token, result) {
    var userToken = jwtDecode(token);
    var username = userToken['cognito:username']
    shared.fetch(queries.LOGIN_USER, [username.toLowerCase()], function(err, res) {
        if(err) {
            console.error(err);
            result(err, null);
        }

        if(res.length === 0) {
            result("Unauthorized", null);
        }

        User.getUserDetailsView(res[0].user_id, function(detailsErr, details) {
            if(detailsErr) console.error(detailsErr, null);
            result(null, new User(res[0],details[0]));
        });
    });
};

User.getAllUsers = function getAllUsers(season, seasonType, week, result) {
    var allUsers = new Promise((resolve, reject) => { 
        shared.fetch(queries.ALL_USERS, [], function(err, res) {
            if(err) reject(err);
            resolve(res);
        });
    });

    var details = new Promise((resolve, reject) => {
        User.getUserDetailsStorProc(season, seasonType, week, function(err, res) {
            if(err) reject(err);
            resolve(res);
        })
    });

    Promise.all([allUsers, details]).then((values) => {
        var fullUsers = [];
        values[0].forEach(user => {
          var userDetail = values[1][0].find(detail => detail.user_id == user.user_id);
          fullUsers.push(new User(user, userDetail));  
        });
        result(null, fullUsers);
    }).catch(error => {
        console.error(error);
        result(error, null);
    })
};

User.updateView = function updateView(season, seasonType, week, result) {
    shared.fetch(queries.UPDATE_STAT_VIEW, [season, seasonType, week], function(err, res){
        if(err) result(err, null);
        result(null, res);
    });
};

User.getUserDetailsView = function getUserDetails(userId, result) {
    shared.fetch(queries.USER_DETAILS,[userId, userId], function(err, res) {
        if(err) result(err, null);
        result(null, res);
    });
}

User.getUserDetailsStorProc = function getUserDetailsStorProc(season, seasonType, week, result) {
    shared.fetch(queries.USER_STANDINGS, [season, seasonType, week], function(err, res) {
        if(err) result(err, null);
        result(null, res);
    })
}

module.exports = User;