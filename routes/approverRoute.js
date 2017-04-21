/**
 * Created by talon.chu on 2017-04-14.
 */
var express = require('express');
var router = express.Router();
var ApplicationEntity = require('../models/Application').ApplicationEntity;
var CommentsEntity = require('../models/Comments').CommentsEntity;
var fs = require('fs');
var path = require('path')
var EMP_NAME = null;
var pageNumber = 1;
var resultsPerPage = 10;

//approve approve the agreement
router.post('/:_id/approved',function (req,res) {
    ApplicationEntity.update({"_id": req.params._id},{$set: {"STATUS":"Approved"}},{"multi" : false,"upsert" : false}, function (err, APPLICATION) {
        if (err) {
            console.log(err);
            return;
        }
        if (APPLICATION) {
            res.json(APPLICATION);
            return;
        }
    });
})
//approver reject and update status
router.post('/:_id/reject', function (req, res) {
    ApplicationEntity.update({"_id": req.params._id},{$set: {"STATUS":"Disapproved"}},{"multi" : false,"upsert" : false}, function (err, APPLICATION) {
        if (err) {
            console.log(err);
            return;
        }
        if (APPLICATION) {
            res.json(APPLICATION);
            return;
        }
    });
})
//approver get the total records of all agreements
router.post('/getTotalPage/getTotal',function (req,res) {
    var status = req.query.status;
    if(status === 'pending'){
        var query = ApplicationEntity.find({'STATUS': {'$in':['Pending']}});
        query.exec(function (err, Application) {
            if(err){
                res.end('DB ERROR');
            } else {
                res.json({"count": Application.length, "totalPage": Math.ceil(Application.length / resultsPerPage)});
            }
        });
    }
    if(status === 'approved'){
        var query = ApplicationEntity.find({'STATUS': {'$in':['Approved']}});
        query.exec(function (err, Application) {
            if(err){
                res.end('DB ERROR');
            } else {
                res.json({"count": Application.length, "totalPage": Math.ceil(Application.length / resultsPerPage)});
            }
        });
    }
});
//approver get the first page
router.post('/getFirstPage/first', function (req, res) {
    var status = req.query.status;
    if(status === 'pending'){
        var query = ApplicationEntity.find({'STATUS': {'$in': ['Pending']}}).sort({"SERVICE_PERIOD_TO" : 1}).skip(0).limit(resultsPerPage)
        query.exec(function (err, Application) {
            if (err) {
                res.end('DB ERROR');
            } else {
                res.json(Application);
                return
            }
        })
    }
    if(status === 'approved'){
        var query = ApplicationEntity.find({'STATUS': {'$in': ['Approved']}}).sort({"SERVICE_PERIOD_TO" : 1}).skip(0).limit(resultsPerPage)
        query.exec(function (err, Application) {
            if (err) {
                res.end('DB ERROR');
            } else {
                res.json(Application);
                return
            }
        })
    }
});
//get proposer's scannings
router.post('/getScannings/:_id', function (req, res) {
    ApplicationEntity.find({"_id": req.params._id}, function (err, APPLICATION) {
        if (err) {
            res.end("error");
        } else {
            var scannings = APPLICATION[0].SCANNING;
            if(scannings){
                var src = APPLICATION[0].SCANNING.split(',');
                var srcLists = new Array();
                for (var i = 0; i < src.length; i++) {
                    srcLists[i] = src[i];
                }
                res.json(srcLists);
            }else
                res.json('');
        }
    });
})
//view scanning
router.post('/viewScanning/:filename', function (req, res) {
    var fileType = req.params.filename.split('.')[1];
    var filePath = path.join(__dirname,'../../','scannings/' + req.params.filename);
    var file = fs.readFileSync(filePath);
    var scanning = new Buffer(file).toString('base64');
    res.end(scanning);
})
//get approver's next page
router.post('/nextPage/:NEXT_PAGE', function (req, res) {
    var status = req.query.status;
    if(status === 'pending'){
        ApplicationEntity.find({'STATUS': {'$in': ['Pending']}},function (err, Application) {
            if (err) {
                res.render('error', {error: "Error"});
                return;
            }
            if (Application) {
                res.json(Application);
                return;
            }
        }).sort({"SERVICE_PERIOD_TO" : 1}).skip(resultsPerPage * req.params.NEXT_PAGE - resultsPerPage).limit(resultsPerPage);
    }
    if(status === 'approved'){
        ApplicationEntity.find({'STATUS': {'$in': ['Approved']}},function (err, Application) {
            if (err) {
                res.render('error', {error: "Error"});
                return;
            }
            if (Application) {
                res.json(Application);
                return;
            }
        }).sort({"SERVICE_PERIOD_TO" : 1}).skip(resultsPerPage * req.params.NEXT_PAGE - resultsPerPage).limit(resultsPerPage);
    }
})
//get previou page lists
router.post("/prevPage/:PREV_PAGE", function (req, res) {
    var status = req.query.status;
    if(status === 'pending'){
        ApplicationEntity.find({'STATUS': {'$in': ['Pending']}},function (err, Application) {
            if (err) {
                res.render('error', {error: "Error"});
                return;
            } else {
                res.json(Application);
                return;
            }
        }).sort({"SERVICE_PERIOD_TO" : 1}).skip(resultsPerPage * req.params.PREV_PAGE - resultsPerPage).limit(resultsPerPage);
    }
    if(status === 'approved'){
        ApplicationEntity.find({'STATUS': {'$in': ['Approved']}},function (err, Application) {
            if (err) {
                res.render('error', {error: "Error"});
                return;
            } else {
                res.json(Application);
                return;
            }
        }).sort({"SERVICE_PERIOD_TO" : 1}).skip(resultsPerPage * req.params.PREV_PAGE - resultsPerPage).limit(resultsPerPage);
    }
});
//get first page
router.post('/firstPage', function (req, res) {
    var status = req.query.status;
    if(status === 'pending'){
        ApplicationEntity.find({'STATUS': {'$in': ['Pending']}},function (err, Application) {
            if (err) {
                res.render('error', {error: "Error"});
                return;
            } else {
                res.json(Application);
                return;
            }
        }).sort({"SERVICE_PERIOD_TO" : 1}).skip(0).limit(resultsPerPage);
    }
    if(status === 'approved'){
        ApplicationEntity.find({'STATUS': {'$in': ['Approved']}},function (err, Application) {
            if (err) {
                res.render('error', {error: "Error"});
                return;
            } else {
                res.json(Application);
                return;
            }
        }).sort({"SERVICE_PERIOD_TO" : 1}).skip(0).limit(resultsPerPage);
    }
});
//get last page
router.post('/lastPage', function (req, res) {
    var status = req.query.status;
    var allSum = req.query.AllSum;
    var limit = allSum % resultsPerPage;
    var skip = allSum - limit;
    if (limit == 0) {
        if(status === 'pending'){
            ApplicationEntity.find({'STATUS': {'$in': ['Pending']}},function (err, Application) {
                if (err) {
                    res.render('error', {error: "Error"});
                    return;
                } else {
                    res.json(Application);
                    return;
                }
            }).sort({"SERVICE_PERIOD_TO" : 1}).skip(skip-resultsPerPage).limit(limit);
        }
        if(status === 'approved'){
            ApplicationEntity.find({'STATUS': {'$in': ['Approved']}},function (err, Application) {
                if (err) {
                    res.render('error', {error: "Error"});
                    return;
                } else {
                    res.json(Application);
                    return;
                }
            }).sort({"SERVICE_PERIOD_TO" : 1}).skip(skip-resultsPerPage).limit(limit);
        }
    }
    else {
        if(status === 'pending'){
            ApplicationEntity.find({'STATUS': {'$in': ['Pending']}},function (err, Application) {
                if (err) {
                    res.render('error', {error: "Error"});
                    return;
                } else {
                    res.json(Application);
                    return;
                }
            }).sort({"SERVICE_PERIOD_TO" : 1}).skip(skip).limit(limit);
        }
        if(status === 'approved'){
            ApplicationEntity.find({'STATUS': {'$in': ['Approved']}},function (err, Application) {
                if (err) {
                    res.render('error', {error: "Error"});
                    return;
                } else {
                    res.json(Application);
                    return;
                }
            }).sort({"SERVICE_PERIOD_TO" : 1}).skip(skip).limit(limit);
        }
    }
});

module.exports = router;