'use strict'
const { WebClient } = require('@slack/web-api');
var league = require('../league/leagueModel');

var Slack = function(){};

Slack.slackProfile = function slackProfile(userId, result) {
    league.leagueSettings(function(err, settings) {
        if(err) {
            console.error(err);
            return result(err, null);
        }
        const token = settings.messageSource.token;
        const web = new WebClient(token);
        (async () => {
            try {
                const response = await web.users.profile.get({
                    user: userId
                });

                let image = response.profile.image_original;
                return result(null, {status: "SUCCESS", imageURL: image})
            } catch(e){
                console.error(e);
                return result(err, null);
            }
        })()
    })
}

module.exports = Slack;