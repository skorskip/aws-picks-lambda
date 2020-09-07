var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors');
var picks = require('./app/controller/pickController');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/user/:userId/season/:season/seasonType/:seasonType/week/:week/', (req, res) => picks.getUsersPicksByWeek(req, res));

app.post('/season/:season/seasonType/:seasonType/week/:week', (req, res) => picks.getPicksByWeek(req, res));

app.post('/create', (req, res) => picks.addPicks(req, res));

app.get('/games/season/:season/seasonType/:seasonType/week/:week', (req, res) => picks.getWeekPicksByGame(req, res));

app.get('/:id', (req, res) => picks.getPick(req, res));
app.put('/:id', (req, res) => picks.updatePick(req, res));
app.delete('/:id', (req,res) => picks.deletePick(req, res));

module.exports = app;