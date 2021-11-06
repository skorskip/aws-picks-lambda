'use strict'

var mysql = require('mysql');
var config = require('./config');

var Fetch = function(){}; 

Fetch.query = function query(query, params, result) {
    var sql = mysql.createConnection(config);

    sql.connect(function(connectErr){
        if (connectErr) {
            result(connectErr, null);
        }
        sql.query(query, params, function(err, res){
            sql.destroy();
            if(err) {
                result(err, null);
            }
            result(null, res)
        });
    });
}

module.exports = Fetch;
