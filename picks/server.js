var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors');
var picks = require('./app/controller/pickController');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// others?user={user}&season={season}&seasonType={seasonType}&week={week}
app.get('/others', (req, res) => picks.getUsersPicksByWeek(req, res));

// week?season={season}&seasonType={seasonType}&week={week}
app.post('/week', (req, res) => picks.getPicksByWeek(req, res));

app.post('/create', (req, res) => picks.addPicks(req, res));

// games?season={season}&seasonType={seasonType}&week={week}
app.get('/games', (req, res) => picks.getWeekPicksByGame(req, res));

app.get('/:id', (req, res) => picks.getPick(req, res));
app.put('/:id', (req, res) => picks.updatePick(req, res));
app.delete('/:id', (req,res) => picks.deletePick(req, res));

module.exports = app;