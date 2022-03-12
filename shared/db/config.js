'use strict'

if(process.env.NODE_ENV === 'local') {
    require('dotenv').config();
}

var config = {
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    host : process.env.DB_HOST,
    port : process.env.DB_PORT,
    database : process.env.DB_DATABASE
}

module.exports = config;