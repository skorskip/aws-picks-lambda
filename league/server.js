var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors');
var league = require('./app/controller/leagueController');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/settings', (req, res) => league.leagueSettings(req, res));

module.exports = app