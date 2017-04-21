var express = require('express');
var router = express.Router();
var ApplicationEntity = require('../models/Application').ApplicationEntity;
var CommentsEntity = require('../models/Comments').CommentsEntity;


//admin accept and update status
router.get('/:_id/accept', function (req, res) {
    ApplicationEntity.update({"_id": req.params._id},{$set: {"STATUS":"Pending","SERVICE_PERIOD_FROM":req.query.serviceFrom,"SERVICE_PERIOD_TO":req.query.serviceTo}},{"multi" : false,"upsert" : false}, function (err, info) {
        if (err) {
            console.log(err);
            return;
        }
        if (info) {
            res.json(info);
            return;
        }
    });
})

//admin reject and update status
router.get('/:_id/reject', function (req, res) {
    ApplicationEntity.update({"_id": req.params._id},{$set: {"STATUS":"Rejected"}},{"multi" : false,"upsert" : false}, function (err, info) {
        if (err) {
            console.log(err);
            return;
        }
        if (info) {
            res.json(info);
            return;
        }
    });
})

module.exports = router;
