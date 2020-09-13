var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
var week = require('./app/controller/weekController');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/current', (req, res) => week.getCurrentWeek(req, res));
app.post('/season/:season/seasonType/:seasonType/week/:week', (req, res) => week.getWeek(req, res));

module.exports = app;