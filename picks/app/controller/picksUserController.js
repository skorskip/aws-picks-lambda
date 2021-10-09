'user strict'

var PicksUser = require('../model/picksUserModel');

exports.getUsersPicksByWeek = function(req, res) {
    PicksUser.getUsersPicksByWeek(req.query.user, req.query.season, req.query.week, req.query.seasonType, function(err, picks) {
        if(err) return res.status(500).send({error: true, message: "Error retrieving users picks", content: err});
        res.json(picks);
    });
};