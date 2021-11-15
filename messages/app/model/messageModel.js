'use strict'
const { WebClient } = require('@slack/web-api');
var shared = require('picks-app-shared');

var Message = function(){}

Message.announcements = function announcements(body, result){
    shared.league(function(err, settings){
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

Message.activeThread = function activeThread(body, result) {
    shared.league(function(err, settings){
        if(err) {
            console.error(err);
            result(err, null);
        }

        const token = settings.messageSource.token;
        const web = new WebClient(token);

        (async () => {
            let liveThreshHoldMins = 20;
            var lastCheckDate = new Date(body.lastCheckDate);
            var currDate = new Date();
            var checkDate = new Date(currDate.setMinutes(currDate.getMinutes() - liveThreshHoldMins));
            
            if(lastCheckDate !== null && lastCheckDate > checkDate) {
                checkDate = lastCheckDate;
            }

            const response = await web.conversations.history({
                channel: settings.messageSource.chatChannel,
                oldest: checkDate.getTime() / 1000
            });
            console.log(response.messages.length > 0);
            result(null, response.messages.length > 0);
            
        })();
    });
}

Message.chatThread = function chatThread(result){
    shared.league(function(err, settings){
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

Message.setReminder = function setReminder(body, result) {
    shared.league(function(err, settings) {
        if(err) {
            console.error(err);
            result(err, null);
        }

        const token = settings.messageSource.token;
        const web = new WebClient(token);
        (async () => {
            try {
                let minsBeforeSubmit = 15;
                let submitDate = new Date(body.pick_submit_by_date);
                let remindTime = new Date(submitDate.setMinutes(submitDate.getMinutes() - minsBeforeSubmit));

                const response = await web.reminders.add({
                    text: "Time to make your picks!",
                    user: body.slack_user_id,
                    time: (remindTime.getTime()/1000).toString(),
                });

                result(null, {status: "SUCCESS", message: response});
            } catch(e) {
                console.error(e);
                result(err, null);
            }
        })();
    });
}

Message.getProfileImage = function getProfileImage(userId, result) {
    shared.league(function(err, settings) {
        if(err) {
            console.error(err);
            result(err, null);
        }
        const token = settings.messageSource.token;
        const web = new WebClient(token);
        (async () => {
            try {
                const response = await web.users.profile.get({
                    user: userId
                });

                let image = response.profile.image_original;
                result(null, {status: "SUCCESS", imageURL: image})
            } catch(e){
                console.error(e);
                result(err, null);
            }
        })()
    })
}

module.exports = Message;
