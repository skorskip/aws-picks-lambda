var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
var week = require('./app/controller/weekController');

if(process.env.NODE_ENV === 'local') {
    require('dotenv').config();
}

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/current', (req, res) => week.getCurrentWeek(req, res));

// ?season={season}&seasonType={seasonType}&week={week}
app.post('/', (req, res) => week.getWeek(req, res));

if(process.env.NODE_ENV === 'local') {
    app.listen(3005, () => console.log('Ready'));
}

module.exports = app;