'use strict'

var mysql = require('mysql2/promise');
var config = require('./config');

var Fetch = function(){}; 

Fetch.query = async function query(query, params) {
    var sql = await mysql.createConnection(config);
    var statement = sql.format(query, params);
    var [result, _]  = await sql.execute(statement);
    await sql.end();
    return result;
}

module.exports = Fetch;
