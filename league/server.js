var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors');
var league = require('./app/controller/leagueController');

if(process.env.NODE_ENV === 'local') {
    require('dotenv').config();
}

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/settings', (req, res) => league.leagueSettings(req, res));

if(process.env.NODE_ENV === 'local') {
    app.listen(3002, () => console.log('Ready'));
}

module.exports = app