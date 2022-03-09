var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors');
var league = require('./app/controller/leagueController');

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

app.get('/settings', runAsyncWrapper(async (req, res) => league.leagueSettings(req, res)));

if(process.env.NODE_ENV === 'local') {
    app.listen(3002, () => console.log('Ready'));
}

module.exports = app