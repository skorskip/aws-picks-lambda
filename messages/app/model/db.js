'use strict'

var config = {
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    host : process.env.DB_HOST,
    port : process.env.DB_PORT,
    databse : process.env.DB_DATABASE
}

module.exports = config;