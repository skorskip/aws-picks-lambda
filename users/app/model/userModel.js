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
    User.standingsSQL(season, seasonType, week, function(standingsCurrErr, standingCurrRes) {
        if(standingsCurrErr) {
            console.error(standingsCurrErr);
            result(standingsCurrErr, null);
        }
        if(week != 1) {
            User.standingsSQL(season, seasonType, (week - 1), function(standingsPrevErr, standingsPrevRes) {
                if(standingsPrevErr) {
                    console.error(standingsPrevErr);
                    result(standingsPrevErr, null);
                }

                standingCurrRes.forEach((standing) => {
                   let standingPrev = standingsPrevRes.find(prev => prev.user_id == standing.user_id);
                   
                   if(standingPrev != null) {
                       standing.prev_ranking = standingPrev.ranking;
                   } else {
                        standing.prev_ranking = standing.ranking;
                   }
                });
                
                result(null, standingCurrRes);
            })
        } else {
            standingCurrRes.forEach((standing) => {
                standing.prev_ranking = standing.ranking;
            });
            result(null, standingCurrRes);
        }
    })
}

User.standingsSQL = function standings(season, seasonType, week, result) {
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

User.getUserPicksLimit = function getUserPicksLimit(season, seasonType, userId, result) {

    var sql  = mysql.createConnection(config);

    sql.connect(function(connectErr) {
        if(connectErr) {
            console.error(connectErr);
            result(err, null);
        }
        sql.query('SELECT user_id, user_type, max_picks, picks_penalty ' +
            'FROM season_users ' + 
            'WHERE season = ? ' +
            'AND season_type = ? ' +
            'AND user_id = ?',
            [season, seasonType, userId],
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
};

module.exports = User;