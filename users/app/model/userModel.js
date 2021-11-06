'use strict';
var jwtDecode = require('jwt-decode');
var queries = require('../utils/queries');
var shared = require('picks-app-shared');

var User = function(userInfo, userCurrSeasonData) {
    this.user_id = userInfo.user_id;
    this.user_name = userInfo.user_name;
    this.first_name = userInfo.first_name;
    this.last_name = userInfo.last_name;
    this.user_inits = userInfo.user_inits;
    this.password = userInfo.password;
    this.email = userInfo.email;
    this.status = userInfo.status;
    this.type = userInfo.type;
    this.slack_user_id = userInfo.slack_user_id;
    this.current_season_data = userCurrSeasonData;

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

        User.getUserDetails(res[0].user_id, function(detailsErr, details) {
            if(detailsErr) console.error(detailsErr, null);
            result(null, new User(res[0],details[0]));
        });
    });
};

User.updateView = function updateView(season, seasonType, week, result) {
    shared.fetch(queries.UPDATE_STAT_VIEW, [season, seasonType, week], function(err, res){
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

User.getUserDetails = function getUserDetails(userId, result) {
    shared.fetch(queries.USER_DETAILS,[userId, userId], function(err, res) {
        if(err) {
            console.error(err);
            result(err, null);
        } else {
            console.log(res);
            result(null, res);
        }
    });
}

module.exports = User;