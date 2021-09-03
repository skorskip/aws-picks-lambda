var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
var users = require('./app/controller/userController');

if(process.env.NODE_ENV === 'local') {
    require('dotenv').config();
}

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.put('/:id', (req, res) => users.updateUser(req, res));
app.delete('/:id', (req, res) => users.deleteUser(req, res));

app.post('/register', (req, res) => users.createUser(req, res));

app.get('/login', (req, res) => users.login(req, res));

// standings?season={season}&seasonType={seasonType}&week={week}
app.get('/standings', (req, res) => users.standings(req, res));

// userPicksLimit?season={season}&seasonType={seasonType}&userId={userId}
app.get('/userPicksLimit', (req, res) => users.getUserPicksLimit(req, res));

if(process.env.NODE_ENV === 'local') {
    app.listen(3004, () => console.log('Ready'));
}

module.exports = app;