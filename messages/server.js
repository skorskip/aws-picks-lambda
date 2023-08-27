var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
var message = require('./app/controller/messageController');

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

app.get('/chat-thread', runAsyncWrapper(async (req, res) => message.chatThread(req, res)));

app.post('/announcements', runAsyncWrapper(async (req, res) => message.announcements(req, res)));
app.post('/active-thread', runAsyncWrapper(async (req, res) => message.activeThread(req, res)));
app.post('/set-reminder', runAsyncWrapper(async (req, res) => message.setReminder(req, res)));

if(process.env.NODE_ENV === 'local') {
    app.listen(3001, () => console.log('Ready'));
}

module.exports = app