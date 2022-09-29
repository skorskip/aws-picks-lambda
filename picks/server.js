var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors');
var picks = require('./app/controller/pickController');
var picksUser = require('./app/controller/picksUserController');

if(process.env.NODE_ENV === 'local') {
    require('dotenv').config();
}

function runAsyncWrapper (callback) {
    return function (req, res, next) {
        callback(req, res, next)
        .catch((next) => {
            console.error(next);
            res.status(500).send(next);
        });
    }
}

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// others?user={user}&season={season}&seasonType={seasonType}&week={week}
app.get('/others', runAsyncWrapper(async (req, res) => picksUser.getUsersPicksByWeek(req, res)));

app.post('/create/:userId', runAsyncWrapper(async (req, res) => picks.addPicks(req, res)));
app.post('/delete', runAsyncWrapper(async (req, res) => picks.deletePicks(req,res)));
app.post('/update', runAsyncWrapper(async (req, res) => picks.updatePicks(req, res)));

// delete?user={user}&season={season}&seasonType={seasonType}&week={week}
app.delete('/week/delete', runAsyncWrapper(async (req, res) => picks.deletePicksWeek(req, res)));

if(process.env.NODE_ENV === 'local') {
    app.listen(3003, () => console.log('Ready'));
}

module.exports = app;