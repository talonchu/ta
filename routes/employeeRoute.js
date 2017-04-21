var express = require('express');
var router = express.Router();
var ApplicationEntity = require('../models/Application').ApplicationEntity;
var CommentsEntity = require('../models/Comments').CommentsEntity;
var EMP_NAME = null;
var pageNumber = 1;
var resultsPerPage = 10;
var multiparty = require('connect-multiparty')
var multipartyMiddleware = multiparty()
var fs = require('fs')
var path = require('path')
var mkdirp = require('mkdirp')

/*get mylist from databse*/
router.get('/:EMP_ID/:EMP_NAME', function (req, res, next) {
    EMP_NAME = req.params.EMP_NAME;
    ApplicationEntity.find({EMP_ID: req.params.EMP_ID}, function (err, Application) {
        if (err) {
            res.render('error', {error: "Error"});
            return;
        }
        if (Application) {
            res.json(Application);
            return;
        }
    });
});

//init first page lists
router.get('/first', function (req, res, next) {
    var query = ApplicationEntity.find().sort({"SERVICE_PERIOD_TO" : 1}).skip(0).limit(10);
    query.exec(function (error, Application) {
        if (error) {
            res.render('error', {error: "Error"});
            return;
        } else {
            res.json(Application);
            return;
        }
    });
});
//get next page lists
router.get("/:NEXT_PAGE", function (req, res) {
    ApplicationEntity.find(function (err, Application) {
        if (err) {
            res.render('error', {error: "Error"});
            return;
        }
        if (Application) {
            res.json(Application);
            return;
        }
    }).sort({"SERVICE_PERIOD_TO" : 1}).skip(resultsPerPage * req.params.NEXT_PAGE - resultsPerPage).limit(resultsPerPage);
});
//get previou page lists
router.post("/:PREV_PAGE/previous", function (req, res) {
    ApplicationEntity.find(function (err, Application) {
        if (err) {
            res.render('error', {error: "Error"});
            return;
        } else {
            res.json(Application);
            return;
        }
    }).sort({"SERVICE_PERIOD_TO" : 1}).skip(resultsPerPage * req.params.PREV_PAGE - resultsPerPage).limit(resultsPerPage);
});

router.get('/:EMP_ID/:EMP_NAME/:DATA_ID/comment', function (req, res, next) {
    CommentsEntity.find({DATA_ID: req.params.DATA_ID}, function (err, Comments) {
        if (err) {
            res.render('error', {error: "Error"});
            return;
        }
        if (Comments) {
            console.log(Comments);
            res.json(Comments);
            return;
        }
    });
});
//get first page
router.post('/:PAGE_NUMBER/first', function (req, res) {
    ApplicationEntity.find(function (err, Application) {
        if (err) {
            res.render('error', {error: "Error"});
            return;
        } else {
            res.json(Application);
            return;
        }
    }).sort({"SERVICE_PERIOD_TO" : 1}).skip(0).limit(resultsPerPage);
});
//get last page
router.post('/last', function (req, res) {
    var allSum = req.query.AllSum;
    var limit = allSum % resultsPerPage;
    var skip = allSum - limit;
    if (limit == 0) {
        ApplicationEntity.find(function (err, Application) {
            if (err) {
                res.render('error', {error: "Error"});
                return;
            } else {
                res.json(Application);
                return;
            }
        }).sort({"SERVICE_PERIOD_TO" : 1}).skip(skip-resultsPerPage).limit(limit);
    }
    else {
        ApplicationEntity.find(function (err, Application) {
            if (err) {
                res.render('error', {error: "Error"});
                return;
            } else {
                res.json(Application);
                return;
            }
        }).sort({"SERVICE_PERIOD_TO" : 1}).skip(skip).limit(limit);
    }
});
//get total page
router.post('/getTotal', function (req, res) {
    ApplicationEntity.find(function (err, Application) {
        if (err) {
            res.render('error', {error: "Error"});
            return;
        } else {
            res.json({"count": Application.length, "totalPage": Math.ceil(Application.length / 10)});
            return;
        }
    });
});

router.post('/:modifiedData/update', multipartyMiddleware, function(req, res) {
    var scanningName = '';
    //new a folder to store scannings(use sync to new the folder first)
    mkdirp.sync('../../scannings');
    for (var i = 0; i < req.files.file.length; i++) {
        var scanning = req.files.file[i];
        var filePath = scanning.path;
        var originalFilename = scanning.originalFilename;
        if (originalFilename !== '') {
            var data = fs.readFileSync(filePath);
            var timestamp = Date.now();
            var type = scanning.type.split('/')[1];
            var poster = timestamp + '.' + type;
            if(i < req.files.file.length-1){
                scanningName += (poster+',');
            }else
                scanningName += poster;
            var newPath = path.join(__dirname, '../../', '/scannings/' + poster);
            //use sync to make sure that save scannings one by one
            fs.writeFileSync(newPath, data)
        } else {
            console.log('file null')
        }
    }
    var dataJson = JSON.parse(req.params.modifiedData);
    dataJson.SCANNING = scanningName;
    ApplicationEntity.update({"_id": dataJson._id}, {$set: {"STATUS": dataJson.STATUS, "CHINESE_NAME" : dataJson.CHINESE_NAME,
    "IDENTIFICATION" : dataJson.IDENTIFICATION, "TRAINING_INSITITUTION" : dataJson.TRAINING_INSITITUTION, "TRAINING_PROGRAM" : dataJson.TRAINING_PROGRAM,
    "TOTAL_COST" : dataJson.TOTAL_COST, "COMPANY_COVER" : dataJson.COMPANY_COVER, "SCANNING" : dataJson.SCANNING,
    "TRAINING_PERIOD_FROM" : dataJson.TRAINING_PERIOD_FROM, "TRAINING_PERIOD_TO" : dataJson.TRAINING_PERIOD_TO}},
        {"multi" : false,"upsert" : false},
        function (err, saved) {
            if (err || !saved)
                res.end("Application not saved");
            else
                res.end("Application saved");
        });
    res.end('saved');
});

router.post('/:addInfo/save', multipartyMiddleware, function (req, res, next) {
    var scanningName = '';
    //new a folder to store scannings(use sync to new the folder first)
    mkdirp.sync('../../scannings');
    for (var i = 0; i < req.files.file.length; i++) {
        var scanning = req.files.file[i];
        var filePath = scanning.path;
        var originalFilename = scanning.originalFilename;
        if (originalFilename !== '') {
            var data = fs.readFileSync(filePath);
            var timestamp = Date.now();
            var type = scanning.type.split('/')[1];
            var poster = timestamp + '.' + type;
            if(i < req.files.file.length-1){
                scanningName += (poster+',');
            }else
                scanningName += poster;
            var newPath = path.join(__dirname, '../../', '/scannings/' + poster);
            //use sync to make sure that save scannings one by one
            fs.writeFileSync(newPath, data)
        } else {
            console.log('file null')
        }
    }
    var dataJson = new ApplicationEntity(JSON.parse(req.params.addInfo));
    dataJson.SCANNING = scanningName;
    dataJson.save(
        function (err, saved) {
            if (err || !saved)
                res.end("Application not saved");
            else
                res.end("Application saved");
    });
    res.end('saved');
});
//get employee's total page
router.post('/getTotalEmployee/:EMP_ID/:EMP_NAME', function (req, res) {
    ApplicationEntity.find({EMP_ID: req.params.EMP_ID}, function (err, Application) {
        if (err) {
            res.render('error', {error: "Error"});
            return;
        } else {
            res.json({"count": Application.length, "totalPage": Math.ceil(Application.length / resultsPerPage)});
            return;
        }
    });
});
//get employee's next page lists
router.post("/employee/:EMP_ID/:NEXT_PAGE", function (req, res) {
    ApplicationEntity.find({'EMP_ID': req.params.EMP_ID}, function (err, Application) {
        if (err) {
            res.render('error', {error: "Error"});
            return;
        }
        if (Application) {
            res.json(Application);
            return;
        }
    }).skip(resultsPerPage * req.params.NEXT_PAGE - resultsPerPage).limit(resultsPerPage);
});
//get employee's previou page lists
router.post("/employee/:EMP_ID/:PREV_PAGE/previous", function (req, res) {
    ApplicationEntity.find({'EMP_ID': req.params.EMP_ID}, function (err, Application) {
        if (err) {
            res.render('error', {error: "Error"});
            return;
        } else {
            res.json(Application);
            return;
        }
    }).skip(resultsPerPage * req.params.PREV_PAGE - resultsPerPage).limit(resultsPerPage);
});
//get employee's first page
router.post('/employee/:PAGE_NUMBER/first/:EMP_ID', function (req, res) {
    ApplicationEntity.find({'EMP_ID': req.params.EMP_ID}, function (err, Application) {
        if (err) {
            res.render('error', {error: "Error"});
            return;
        } else {
            res.json(Application);
            return;
        }
    }).skip(0).limit(resultsPerPage);
});
//get employee's last page
router.post('/last/:EMP_ID', function (req, res) {
    var allSum = req.param('AllSum');
    var limit = allSum % resultsPerPage;
    var skip = allSum - limit;
    if (limit == 0) {
        ApplicationEntity.find({'EMP_ID': req.params.EMP_ID}, function (err, Application) {
            if (err) {
                res.render('error', {error: "Error"});
                return;
            } else {
                res.json(Application);
                return;
            }
        }).skip(skip - resultsPerPage).limit(limit);
    }
    else {
        ApplicationEntity.find({'EMP_ID': req.params.EMP_ID}, function (err, Application) {
            if (err) {
                res.render('error', {error: "Error"});
                return;
            } else {
                res.json(Application);
                return;
            }
        }).skip(skip).limit(limit);
    }
});
//init employee's first page lists
router.post('/first/:EMP_ID', function (req, res, next) {
    var query = ApplicationEntity.find({'EMP_ID': req.params.EMP_ID}).skip(0).limit(resultsPerPage);
    query.exec(function (error, Application) {
        if (error) {
            res.render('error', {error: "Error"});
            return;
        } else {
            res.json(Application);
            return;
        }
    });
});

module.exports = router;
