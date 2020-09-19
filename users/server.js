var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
var users = require('./app/controller/userController');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.put('/:id', (req, res) => users.updateUser(req, res));
app.delete('/:id', (req, res) => users.deleteUser(req, res));

app.post('/register', (req, res) => users.createUser(req, res));

app.post('/login', (req, res) => users.login(req, res));

// standings?season={season}&seasonType={seasonType}
app.get('/standings', (req, res) => users.standings(req, res));

// standings?season={season}&seasonType={seasonType}&week={week}
app.post('/standings', (req, res) => users.standingsByUser(req, res));

module.exports = app;