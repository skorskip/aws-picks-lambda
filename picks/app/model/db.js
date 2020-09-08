'user strict';

var mysql = require('mysql');
var config = require('../../config.json')

//local mysql db connection
var connection = mysql.createPool(config.database);

module.exports = connection;