'user strict'

var PicksUser = require('../model/picksUserModel');

exports.getUsersPicksByWeek = async function(req, res) {
    var picks = await PicksUser.getUsersPicksByWeek(
        req.query.user, 
        req.query.season, 
        req.query.week, 
        req.query.seasonType);
    res.json(picks);
};