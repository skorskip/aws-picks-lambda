'use strict'
const { WebClient } = require('@slack/web-api');
var league = require('../league/leagueModel');

var Slack = function(){};

Slack.slackProfile = async function slackProfile(userId) {
    let settings = await league.leagueSettings();
    const token = settings.messageSource.token;
    const web = new WebClient(token);
    const response = await web.users.profile.get({user: userId});

    let image = response.profile.image_original;
    return {status: "SUCCESS", imageURL: image};
}

Slack.slackProfileByEmail = async function slackByEmail(email) {
    let settings = await league.leagueSettings();
    const token = settings.messageSource.token;
    const web = new WebClient(token);
    const response = await web.users.lookupByEmail({email});

    let userId = response.user.id;
    return {status: "SUCCESS", userId: userId};
}

module.exports = Slack;