var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
var message = require('./app/controller/messageController');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/announcements', (req, res) => message.announcements(req, res));
app.get('/chat-thread', (req, res) => message.chatThread(req, res));
app.post('/active-thread', (req, res) => message.activeThread(req, res));

//app.listen(3000, () => console.log('Ready'));
module.exports = app