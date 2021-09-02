var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors');
var picks = require('./app/controller/pickController');

if(process.env.NODE_ENV === 'local') {
    require('dotenv').config();
}

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// others?user={user}&season={season}&seasonType={seasonType}&week={week}
app.get('/others', (req, res) => picks.getUsersPicksByWeek(req, res));

// week?season={season}&seasonType={seasonType}&week={week}
app.post('/week', (req, res) => picks.getPicksByWeek(req, res));

app.post('/create', (req, res) => picks.addPicks(req, res));
app.post('/v2/create/:userId', (req, res) => picks.addPicksV2(req, res));

// games?season={season}&seasonType={seasonType}&week={week}
app.get('/games', (req, res) => picks.getWeekPicksByGame(req, res));

app.put('/:id', (req, res) => picks.updatePick(req, res));
app.delete('/:id', (req,res) => picks.deletePick(req, res));

app.post('/v2/delete/:userId', (req, res) => picks.deletePicksV2(req,res));
app.post('/v2/update/:userId', (req, res) => picks.updatePicksV2(req, res));

if(process.env.NODE_ENV === 'local') {
    app.listen(3003, () => console.log('Ready'));
}

module.exports = app;