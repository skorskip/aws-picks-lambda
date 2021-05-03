'use strict'
var League = require('./leagueModel');
const { WebClient } = require('@slack/web-api');

var Message = function(){}

Message.announcements = function announcements(body, result){
    League.leagueSettings(function(err, settings){
        if(err) {
            console.error(err);
            result(err, null);
        }

        const token = settings.messageSource.token;
        const web = new WebClient(token);

        (async () => {

            var lastChecked = new Date(body.lastCheckDate);
            var currDate = new Date();
            var oldestMessage = new Date(currDate.setDate(currDate.getDate() - 20));

            if(lastChecked == null){
                lastChecked = 0;
            } else {
                lastChecked = lastChecked.getTime() / 1000;
            }
    
            var responseObject = {};
            responseObject.announcements = 0;
            responseObject.announcement_date = new Date();
    
            const response = await web.conversations.history({
                channel: settings.messageSource.channel,
                oldest: oldestMessage.getTime() / 1000
            });
            
            var lastestTs = 0;
            responseObject.messages = [];

            for(let i = 0; i < response.messages.length; i++) {
                let message = response.messages[i];
                let messageObject = {};

                if(message.ts > lastChecked) {
                    responseObject.announcements += 1;
                    if(message.ts > lastestTs) {
                        lastestTs = message.ts;
                    }
                }
                
                messageObject.date = new Date(message.ts * 1000);
                messageObject.message = message.text;

                responseObject.messages.push(messageObject);
            }
    
            responseObject.announcement_date = new Date(lastestTs * 1000);
            console.log(responseObject);
            result(null, responseObject);
        })();
    });
}

Message.chatThread = function chatThread(result){
    League.leagueSettings(function(err, settings){
        if(err) {
            console.error(err);
            result(err, null);
        }

        const token = settings.messageSource.token;
        const web = new WebClient(token);
        (async () => {
            var threadStart = {messages: []}
            try {
                threadStart = await web.conversations.history({
                    channel: settings.messageSource.chatChannel,
                    limit: 1
                });
            } catch(e) {
                console.error(e);
                result(e, null);
            }

            if(threadStart.messages.length === 0) {
                console.error("No thread start found.");
                result("No thread start found.", null);
            }
            var response = {}
            try {
                response = await web.chat.getPermalink({
                    channel: settings.messageSource.chatChannel,
                    message_ts: threadStart.messages[0].ts
                });
            } catch(e) {
                console.error(e);
                result(e, null);
            }

            console.log(response);
            result(null, response);
        })();
    });
}

module.exports = Message;
