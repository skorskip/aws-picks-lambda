var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
var week = require('./app/controller/weekController');

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

// ?season={season}&seasonType={seasonType}&week={week}
app.get('/', runAsyncWrapper(async (req, res) => week.getWeek(req, res)));

if(process.env.NODE_ENV === 'local') {
    app.listen(3005, () => console.log('Ready'));
}

module.exports = app;