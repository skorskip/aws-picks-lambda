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
app.get('/week', (req, res) => picks.getPicksByWeek(req, res));

// games?season={season}&seasonType={seasonType}&week={week}
app.get('/games', (req, res) => picks.getWeekPicksByGame(req, res));

app.post('/create/:userId', (req, res) => picks.addPicks(req, res));
app.post('/delete', (req, res) => picks.deletePicks(req,res));
app.post('/update', (req, res) => picks.updatePicks(req, res));

if(process.env.NODE_ENV === 'local') {
    app.listen(3003, () => console.log('Ready'));
}

module.exports = app;