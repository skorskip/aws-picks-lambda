var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
var users = require('./app/controller/userController');

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

app.put('/:id', runAsyncWrapper(async (req, res) => users.updateUser(req, res)));
app.delete('/:id', runAsyncWrapper(async (req, res) => users.deleteUser(req, res)));
app.post('/register', runAsyncWrapper(async (req, res) => users.createUser(req, res)));
app.get('/login', runAsyncWrapper(async (req, res) => users.login(req, res)));
// standings?season={season}&seasonType={seasonType}&week={week}
app.get('/standings', runAsyncWrapper(async (req, res) => users.getAllUsers(req, res)));
app.get('/update-user-profile', runAsyncWrapper(async (req, res) => users.updateUserProfile(req, res)));
app.post('/add-slack-id', runAsyncWrapper(async (req, res) => users.addSlackId(req, res)));
// bonus-streak?season={season}&seasonType={seasonType}&week={week}
app.get('/bonus-streak', runAsyncWrapper(async (req, res) => users.getBonusUsers(req, res)));

if(process.env.NODE_ENV === 'local') {
    app.listen(3004, () => console.log('Ready'));
}

module.exports = app;