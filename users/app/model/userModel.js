'use strict';
var sql = require('./db.js');

var User = function(user) {
    this.user_name = user.user_name;
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.user_init = user.user_init;
    this.password = user.password;
    this.email = user.email;
}

User.updateUser = function updateUser(userId, user, result) {
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
        if(err) result(null, 'FAILURE');
        else {
            if(res.affectedRows == 1) {
                result(null, 'SUCCESS');
            } else {
                result(null, 'FAILURE')
            }
        }
    });
};

User.deleteUser = function deleteUser(userId, result) {
    sql.query('DELETE FROM users WHERE user_id = ?', userId, function(err, res) {
        if(err) result(err, null);
        else result(null, res);
    });
};

User.createUser = function createUser(user, result) {
    sql.query('INSERT INTO users SET ?', user, function(err, res) {
        if(err) result(null, 'FAILURE');
        else result(null, 'SUCCESS');
    });
};

User.login = function login(userPass, result) {
    sql.query('SELECT * ' +
        'FROM users ' +
        'WHERE (LOWER(user_name) = ? OR email = ?) ' +
        'AND sha2(concat(password_salt,?),256) = password', [userPass.user_name.toLowerCase(), userPass.user_name, userPass.password], function(err, res) {
        if(err) result(err, null);
        else result(null,res);
    })
};

User.standings = function standings(season, seasonType, result) {
    sql.query(
        'SELECT * ' +
        'FROM rpt_user_stats ' +
        'WHERE season = ? ' +
        'AND season_type = ? ' +
        'ORDER BY ranking, wins desc, tie_breaks desc', [season, seasonType], function(err, res) {
            if(err) result(err, null);
            else result(null, res)
        });
};

User.standingsByUser = function standingsByUser(season, seasonType, user, result) {
    sql.query(
        'SELECT * ' +
        'FROM rpt_user_stats ' +
        'WHERE season = ? ' +
        'AND season_type = ? ' +
        'AND user_id = ? ' +
        'ORDER BY ranking, wins desc, tie_breaks desc', [season, seasonType, user.user_id], function(err, res) {
            if(err) result(err, null);
            else result(null, res)
        });
};  

module.exports = User;