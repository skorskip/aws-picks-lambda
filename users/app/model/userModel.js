'use strict';
var mysql = require('mysql');
var config = require('./db');

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

    sql.connect(function(err){
        if (err) {
            console.log(err);
            result(err, null);
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
                console.log("FAILURE");
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

    sql.connect(function(err){
        if (err) {
            console.log(err);
            result(err, null);
        }
        sql.query('DELETE FROM users WHERE user_id = ?', userId, function(err, res) {
            sql.destroy();
            if(err) {
                console.log(err);
                result(err, null);
            }
            else {
                console.log(err);
                result(null, res);
            }
        });
    });
};

User.createUser = function createUser(user, result) {
    var sql = mysql.createConnection(config);

    sql.connect(function(err){
        if (err) {
            console.log(err);
            result(err, null);
        }
        sql.query('INSERT INTO users SET ?', user, function(err, res) {
            sql.destroy();
            if(err) {
                console.log('FAILURE');
                result(null, 'FAILURE');
            }
            else {
                console.log("SUCCESS");
                result(null, 'SUCCESS');
            }
        });
    });

};

User.login = function login(userPass, result) {
    var sql = mysql.createConnection(config);

    sql.connect(function(err){
        if (err) {
            console.log(err);
            result(err, null);
        }
        sql.query('SELECT * ' +
        'FROM users ' +
        'WHERE (LOWER(user_name) = ? OR email = ?) ' +
        'AND sha2(concat(password_salt,?),256) = password', [userPass.user_name.toLowerCase(), userPass.user_name, userPass.password], function(err, res) {
            sql.destroy();
            if(err) {
                console.log(err);
                result(err, null);
            }
            else {
                console.log(res);
                result(null,res);
            }
        });
    });

};

User.standings = function standings(season, seasonType, result) {
    var sql = mysql.createConnection(config);

    sql.connect(function(err){
        if (err) {
            console.log(err);
            result(err, null);
        }
        sql.query(
            'SELECT * ' +
            'FROM rpt_user_stats ' +
            'WHERE season = ? ' +
            'AND season_type = ?', [season, seasonType], function(err, res) {
                sql.destroy();
                if(err) {
                    console.log(err);
                    result(err, null);
                }
                else {
                    console.log(res);
                    result(null, res);
                }
            });
    });
};

User.standingsByUser = function standingsByUser(season, seasonType, week, user, result) {
    User.updateView(season, seasonType, week, function(errUpdate, resUpdate) {

        if(errUpdate) {
            console.log(errUpdate);
            result(errUpdate, null);
        }

        var sql = mysql.createConnection(config);

        sql.connect(function(err){
            if (err) {
                console.log(err);
                result(err, null);
            }
            sql.query(
                'SELECT * ' +
                'FROM rpt_user_stats ' +
                'WHERE season = ? ' +
                'AND season_type = ? ' +
                'AND user_id = ?', [season, seasonType, user.user_id], function(err, res) {
                    sql.destroy();
                    if(err) {
                        console.log(err);
                        result(err, null);
                    }
                    else {
                        console.log(res);
                        result(null, res);
                    }
                });
        });
    })
};

User.updateView = function updateView(season, seasonType, week, result) {
    var sql = mysql.createConnection(config);

    sql.connect(function(err) {
        if(err) {
            console.log(err);
            result(err, null);
        }
        sql.query('CALL update_weekly_user_stats(?, ?, ?)', [season, seasonType, week], function(err, res){
            sql.destroy();
            if(err) {
                console.log(err);
                result(err, null);
            }
            else {
                console.log(res);
                result(null, res);
            }
        });
    })
}

module.exports = User;