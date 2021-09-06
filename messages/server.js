var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
var message = require('./app/controller/messageController');

if(process.env.NODE_ENV === 'local') {
    require('dotenv').config();
}


app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/announcements', (req, res) => message.announcements(req, res));
app.get('/chat-thread', (req, res) => message.chatThread(req, res));
app.post('/active-thread', (req, res) => message.activeThread(req, res));

if(process.env.NODE_ENV === 'local') {
    app.listen(3001, () => console.log('Ready'));
}

module.exports = app