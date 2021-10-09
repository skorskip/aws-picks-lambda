'use strict'

var Pick = require('../model/pickModel.js');

exports.addPicks = function(req, res) {
    Pick.addPicks(req.params.userId, req.body, req.headers.authorization, function(err, status) {
        if(err) return res.status(500).send({error: true, message: "Error adding picks", content: err});
        res.json(status);
    })
}

exports.updatePicks = function(req, res) {
    Pick.updatePicks(req.body, req.headers.authorization, function(err, status) {
        if(err) return res.status(500).send({error: true, message: "Error updating pick", content: err});
        res.json(status);
    })
}

exports.deletePicks = function(req, res) {
    Pick.deletePick(req.body, req.headers.authorization, function(err, status) {
        if(err) return res.status(500).send({error: true, message: "Error updating pick", content: err});
        res.json(status);
    })
}