'use strict';
var mysql = require('mysql');
var config = require('./db');
var jwtDecode = require('jwt-decode');

var User = function(user) {
    this.user_name = user.user_name;
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.user_init = user.user_init;
    this.password = user.password;
    this.email = user.email;
}

User.updateUser = function updateUser(userId, user, result) {
    var sql = mysql.createConnection(config);

    sql.connect(function(connectErr){
        if (connectErr) {
            console.error(connectErr);
            result(connectErr, null);
        }
        sql.query('UPDATE users SET ' +
        'user_name = ?, ' + 
        'first_name = ?, ' +
        'last_name = ?, ' +
        'email = ?, ' +
        'password = sha2(concat(password_salt,?),256) ' +
        'WHERE user_id = ?', [
            user.user_name,
            user.first_name,
            user.last_name,
            user.email,
            user.password, 
            userId], function(err, res){
            
            sql.destroy();
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
    });
};

User.deleteUser = function deleteUser(userId, result) {
    var sql = mysql.createConnection(config);

    sql.connect(function(connectErr){
        if (connectErr) {
            console.error(connectErr);
            result(connectErr, null);
        }
        sql.query('DELETE FROM users WHERE user_id = ?', userId, function(err, res) {
            sql.destroy();
            if(err) {
                console.error(err);
                result(err, null);
            }
            else {
                console.log(res);
                result(null, res);
            }
        });
    });
};

User.createUser = function createUser(user, result) {
    var sql = mysql.createConnection(config);

    sql.connect(function(connectErr){
        if (connectErr) {
            console.error(connectErr);
            result(connectErr, null);
        }
        sql.query('INSERT INTO users SET ?', user, function(err, res) {
            sql.destroy();
            if(err) {
                console.error('FAILURE');
                result(null, 'FAILURE');
            }
            else {
                console.log("SUCCESS");
                result(null, 'SUCCESS');
            }
        });
    });

};

User.login = function login(token, result) {
    var userToken = jwtDecode(token);
    var username = userToken['cognito:username']
    var sql = mysql.createConnection(config);

    sql.connect(function(connectErr){
        if (connectErr) {
            console.error(connectErr);
            result(connectErr, null);
        }
        sql.query('SELECT * ' +
        'FROM users ' +
        'WHERE (LOWER(user_name) = ?)',
        [username.toLowerCase()], function(err, res) {
            sql.destroy();
            if(err) {
                console.error(err);
                result(err, null);
            }

            if(res.length === 0) {
                result("Unauthorized", null);
            }
            console.log(res);
            result(null,res);
        });
    });
};

User.standings = function standings(season, seasonType, week, result) {
    var sql = mysql.createConnection(config);

    sql.connect(function(connectErr){
        if (connectErr) {
            console.error(connectErr);
            result(connectErr, null);
        }
        sql.query(
            'CALL get_user_standings(?,?,?)', [season, seasonType, week], function(err, res) {
                sql.destroy();
                if(err) {
                    console.error(err);
                    result(err, null);
                }
                else {
                    console.log(res);
                    result(null, res[0]);
                }
            });
    });
};

User.updateView = function updateView(season, seasonType, week, result) {
    var sql = mysql.createConnection(config);

    sql.connect(function(connectErr) {
        if(connectErr) {
            console.error(connectErr);
            result(err, null);
        }
        sql.query('CALL update_weekly_user_stats(?, ?, ?)', [season, seasonType, week], function(err, res){
            sql.destroy();
            if(err) {
                console.error(err);
                result(err, null);
            }
            else {
                console.log(res);
                result(null, res);
            }
        });
    });
};

User.getUserDetails = function getUserDetails(userId, result) {
    var sql  = mysql.createConnection(config);

    sql.connect(function(connectErr) {
        if(connectErr) {
            console.error(connectErr);
            result(err, null);
        }
        sql.query('SELECT s.user_id, s.user_type, s.max_picks, s.picks_penalty, r.pending_picks, r.picks,  r.ranking, r.wins, r.win_pct' +
            'FROM season_users s, config c, rpt_user_stats r ' + 
            'WHERE c.status = \'active\' ' +   
            'AND s.season = JSON_VALUE(c.settings, \'$.currentSeason\') ' +
            'AND s.season_type = JSON_VALUE(c.settings, \'$.currentSeasonType\') ' +
            'AND r.season = JSON_VALUE(c.settings, \'$.currentSeason\') ' +
            'AND r.season_type = JSON_VALUE(c.settings, \'$.currentSeasonType\') ' +
            'AND s.user_id = ? ' +
            'AND r.user_id = ?',
            [userId, userId],
            function(err, res) {
                sql.destroy();
                if(err) {
                    console.error(err);
                    result(err, null);
                } else {
                    console.log(res);
                    result(null, res);
                }
            }
        )
    });
}

module.exports = User;