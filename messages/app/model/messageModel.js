'use strict'
const { WebClient } = require('@slack/web-api');
var shared = require('picks-app-shared');

var Message = function(){}

Message.announcements = async function announcements(body){
    var settings = await shared.league();

    const token = settings.messageSource.token;
    const web = new WebClient(token);

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
    return responseObject;
}

Message.activeThread = async function activeThread(body) {
    var settings = await shared.league();

    const token = settings.messageSource.token;
    const web = new WebClient(token);

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

    return response.messages.length > 0;
}

Message.chatThread = async function chatThread(){
    var settings = await shared.league();
    const token = settings.messageSource.token;
    const web = new WebClient(token);

    var threadStart = {messages: []}
        threadStart = await web.conversations.history({
            channel: settings.messageSource.chatChannel,
            limit: 1
        });

    if(threadStart.messages.length === 0) {
        return {message: "No thread start found."};
    }

    var response = await web.chat.getPermalink({
        channel: settings.messageSource.chatChannel,
        message_ts: threadStart.messages[0].ts
    });

    return response;
}

Message.setReminder = async function setReminder(body) {
    var settings = await shared.league();

    const token = settings.messageSource.token;
    const web = new WebClient(token);
    let minsBeforeSubmit = 15;
    let submitDate = new Date(body.pick_submit_by_date);
    let remindTime = new Date(submitDate.setMinutes(submitDate.getMinutes() - minsBeforeSubmit));

    const response = await web.reminders.add({
        text: "Time to make your picks!",
        user: body.slack_user_id,
        time: (remindTime.getTime()/1000).toString(),
    });

    return {status: "SUCCESS", message: response};
}

module.exports = Message;
