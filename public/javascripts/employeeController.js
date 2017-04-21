var employeeControllers = angular.module('employeeControllers', [])
var resultsPerPage = 10;


//Employee List
employeeControllers.controller("EmployeeListCtrl", ["$scope", "$http", "$timeout", "$filter", "Upload", "$location",
    function ($scope, $http, $timeout, $filter, Upload, $location) {
        $('#empClass').attr('class', 'active');
        $('#allClass').removeAttr('class', 'active');
        $('#addClass').removeAttr('class', 'active');
        $('#approverClass').removeAttr('class', 'active');
        //init page number
        var login_name = $('#login_name').text();
        $scope.pageNumber = 1;
        $scope.isok = false;
        $scope.warningMsg = "";
        $('#prevPageBtn').attr("disabled", "true");

        //GET Employee info FROM TPT
        $http({
            method: 'JSONP',
            url: 'http://10.2.1.74:8080/tpt2013-portlet/resteasy/employees?callback=JSON_CALLBACK'
        }).success(function (response) {
            var EmpInfo = angular.fromJson(response);
            for (var i = 0; i < EmpInfo.length; i++) {
                if (EmpInfo[i].screenName === login_name) {
                    $scope.empid = EmpInfo[i].emid;
                    $scope.empname = EmpInfo[i].screenName;
                }
            }

            //GET ALL CERTIFICATION FROM TPT
            $http({
                method: 'JSONP',
                url: 'http://10.2.1.74:8080/tpt2013-portlet/resteasy/certification/all?callback=JSON_CALLBACK'
            }).success(function (response) {
                var allCerts = angular.fromJson(response);
                var programList = new Array();
                for (var i = 0; i < allCerts.length; i++) {
                    var p = new Object();
                    p.programName = allCerts[i].certificationName;
                    programList.push(p);
                }
                $scope.allProgram = programList;
            }).error(function () {

            });

            //get eemployee's total page
            $http({
                method: 'POST',
                url: '/getTotalPageEmployee/getTotalEmployee/' + $scope.empid + '/' + $scope.empname,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function (response) {
                $scope.AllSum = response.count;
                $scope.totalPage = response.totalPage;
                if (response.count < resultsPerPage) {
                    $('#nextPageBtn').attr('disabled', 'true');
                    $('#prevPageBtn').attr('disabled', 'true');
                }
            });

            //init employee's index page lists
            $http({
                method: 'POST',
                url: '/getFirstPage/first' + '/' + $scope.empid,//Analog data
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function (response) {
                if (response.length < resultsPerPage || $scope.AllSum === resultsPerPage) {
                    $scope.employeeApplications = response;
                    $('#nextPageBtn').attr('disabled', 'true');
                    $('#lastPageBtn').attr('disabled', 'true');
                    $('#firstPageBtn').attr('disabled', 'true');
                } else {
                    $scope.employeeApplications = response;
                }
            }).error(function () {
                console.log('fecth failed');
            });


            //go to employee's next page
            $scope.nextPage = function () {
                var nextPage = $scope.pageNumber + 1;
                $http({
                    method: 'POST',
                    url: '/nextPage/employee/' + $scope.empid + "/" + nextPage,//Analog data
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function (response) {
                    if (response.length === 0) {
                        $('#nextPageBtn').attr("disabled", "true");
                    }
                    else if (response.length < resultsPerPage) {
                        $('#nextPageBtn').attr("disabled", "true");
                        $('#prevPageBtn').removeAttr("disabled");
                        $scope.employeeApplications = response;
                        $scope.pageNumber++;
                    }
                    else {
                        $('#prevPageBtn').removeAttr("disabled");
                        $scope.employeeApplications = response;
                        $scope.pageNumber++;
                    }
                }).error(function () {
                    console.log('fecth failed');
                });
            }

            //go to employee's previous page
            $scope.prevPage = function () {
                var prevPage = $scope.pageNumber - 1;
                $http({
                    method: 'POST',
                    url: '/prevPage/employee/' + $scope.empid + '/' + prevPage + '/previous',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function (response) {
                    if ($scope.pageNumber === 1) {
                        $scope.employeeApplications = response;
                        $('#prevPageBtn').attr("disabled", "true");
                        $('#nextPageBtn').removeAttr("disabled");
                    }
                    else {
                        $scope.employeeApplications = response;
                        $('#nextPageBtn').removeAttr("disabled");
                    }
                }).error(function () {
                    console.log('fecth failed');
                });
                $scope.pageNumber--;
            };

            //go to employee's first page
            $scope.firstPage = function () {
                $http({
                    method: 'post',
                    url: '/firstPage/employee/1/first' + '/' + $scope.empid,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function (response) {
                    $scope.employeeApplications = response;
                    if ($scope.AllSum <= resultsPerPage) {
                        $('#nextPageBtn').attr("disabled", 'true');
                        $('#prevPageBtn').attr("disabled", "true");
                        $scope.pageNumber = 1;
                    }
                    else {
                        $('#nextPageBtn').removeAttr("disabled");
                        $('#prevPageBtn').attr("disabled", "true");
                        $scope.pageNumber = 1;
                    }
                }).error(function () {
                    console.log('fecth failed');
                });
            };

            //go to employee's last page
            $scope.lastPage = function () {
                $http({
                    method: 'post',
                    url: '/lastPage/last' + '/' + $scope.empid,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    params: {"AllSum": $scope.AllSum}
                }).success(function (response) {
                    $scope.employeeApplications = response;
                    $('#nextPageBtn').attr("disabled", "true");
                    $('#prevPageBtn').removeAttr("disabled");
                    $scope.pageNumber = $scope.totalPage;
                }).error(function () {
                    console.log('fecth failed');
                });
            };

            //Send request to database
            $http({
                method: 'get',
                url: '/employee/list/' + $scope.empid + '/' + $scope.empname,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function (response) {
                $scope.sum = response.length;
                var data = eval(response);
                var emp_id = data[0].EMP_ID;
                var emp_name = data[0].EMP_NAME;
                setCookie("EMP_ID", emp_id, 365);
                setCookie("EMP_NAME", emp_name, 365);
            }).error(function () {
                console.log('fecth failed');
            });

            //put the user information in a Cookie
            function setCookie(c_name, value, expiredays) {
                var exdate = new Date()
                exdate.setDate(exdate.getDate() + expiredays)
                document.cookie = c_name + "=" + escape(value) +
                    ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString())
            }


            //Employee List each item's detail
           /* $scope.detailView = function (ve) {
                $('#dd' + ve).hide();
                $('#cc' + ve).hide();
                if ($scope.now === null) {
                    $('#' + ve).css('background', '#E1E7EC');
                    $('#employeedetail' + ve).slideDown();
                    $scope.now = ve;
                } else if ($scope.now === ve) {
                    $('#' + ve).css('background', '');
                    $('#employeedetail' + ve).slideUp();
                    $scope.now = null;
                } else {
                    $('#employeedetail' + $scope.now).slideUp();
                    $($scope.now).css('background', '');
                    $timeout(function () {
                        $('#' + ve).css('background', '#E1E7EC');
                        $('#employeedetail' + ve).slideDown();
                        $scope.now = ve;
                    }, 400);
                }
            };*/

            $scope.checkChineseName = function (chineseName, role, id) {
                return checkChineseName(chineseName, role, id);
            };

            $scope.checkIdNumber = function (identification, role, id) {
                return checkIdNumber(identification, role, id);
            };

            $scope.checkMoney = function (totalCost, companyCover, role, id) {
                return checkMoney(totalCost, companyCover, role, id);
            };

            $scope.checkTime = function (trainingPeriodFrom, trainingPeriodTo, role, id) {
                return checkTime(trainingPeriodFrom, trainingPeriodTo, role, id);
            };

            $scope.checkAll = function (application, role, id) {
                return checkAll(application, role, id);
            };

            $scope.checkDisplay = function (_id, _position) {
                $scope.warningMsg = "";
                var chineseNameCheck = $scope.checkChineseName($scope.employeeApplications[_position].CHINESE_NAME, "", _id);
                if (chineseNameCheck !== "" && $scope.warningMsg === "")
                    $scope.warningMsg = chineseNameCheck;
                var idNumberCheck = $scope.checkIdNumber($scope.employeeApplications[_position].IDENTIFICATION, "", _id);
                if (idNumberCheck !== "" && $scope.warningMsg === "")
                    $scope.warningMsg = idNumberCheck;
                var moneyCheck = $scope.checkMoney($scope.employeeApplications[_position].TOTAL_COST, $scope.employeeApplications[_position].COMPANY_COVER, "", _id);
                if (moneyCheck !== "" && $scope.warningMsg === "")
                    $scope.warningMsg = moneyCheck;
                var timeCheck = $scope.checkTime($scope.employeeApplications[_position].TRAINING_PERIOD_FROM, $scope.employeeApplications[_position].TRAINING_PERIOD_TO, "", _id);
                if (timeCheck !== "" && $scope.warningMsg === "")
                    $scope.warningMsg = timeCheck;
                if ($scope.submitted) {
                    var allCheck = $scope.checkAll($scope.employeeApplications[_position], "", _id);
                    if (allCheck !== "") {
                        if ($scope.warningMsg === "")
                            $scope.warningMsg = allCheck;
                    } else
                        $scope.submitted = false;
                }
                if ($scope.isok && $scope.warningMsg === "") {
                    $('#trainingProgram' + _id).css("border-color", "red");
                    $scope.warningMsg = "Your application of the training program already exists";
                }
                if ($scope.warningMsg === "")
                    return "none";
                return "block";
            };

            $scope.change = function () {
                $('#trainingProgram').css("border-color", "");
                $scope.isok = false;
            };

            $scope.toJSON = function (_position) {
                $scope.employeeApplications[_position].REASON = $scope.employeeApplications[_position].REASON.replace(/\\/g, 'exchangesprit');
                $scope.employeeApplications[_position].REASON = $scope.employeeApplications[_position].REASON.replace(/\//g, 'exchangeversprit');
                $scope.employeeApplications[_position].REASON = $scope.employeeApplications[_position].REASON.replace(/\n/g, 'exchangeenter');
                $scope.employeeApplications[_position].REASON = $scope.employeeApplications[_position].REASON.replace(/\r/g, 'exchanger');
                $scope.employeeApplications[_position].REASON = $scope.employeeApplications[_position].REASON.replace(/\"/g, 'exchangeyin');
                $scope.employeeApplications[_position].TRAINING_INSTITUTION = $scope.employeeApplications[_position].TRAINING_INSTITUTION.replace(/\"/g, 'exchangeyin');
                $scope.employeeApplications[_position].TRAINING_INSTITUTION = $scope.employeeApplications[_position].TRAINING_INSTITUTION.replace(/\\/g, 'exchangesprit');
                $scope.employeeApplications[_position].TRAINING_INSTITUTION = $scope.employeeApplications[_position].TRAINING_INSTITUTION.replace(/\//g, 'exchangeversprit');
                $scope.employeeApplications[_position].TRAINING_PROGRAM = $scope.employeeApplications[_position].TRAINING_PROGRAM.replace(/\"/g, 'exchangeyin');
                $scope.employeeApplications[_position].TRAINING_PROGRAM = $scope.employeeApplications[_position].TRAINING_PROGRAM.replace(/\\/g, 'exchangesprit');
                $scope.employeeApplications[_position].TRAINING_PROGRAM = $scope.employeeApplications[_position].TRAINING_PROGRAM.replace(/\//g, 'exchangeversprit');
                return $filter('json')($scope.employeeApplications[_position]);
            };

            $scope.submit = function(_id, _position) {
                var file = $scope.employeeApplications[_position].picFile;
                file = (file === undefined || file === null) ? [] : file;
                $scope.submitted = true;
                $scope.employeeApplications[_position].STATUS = 'submitted';
                if ($scope.checkDisplay(_id, _position) === "block")
                    return;
                var application = $scope.toJSON(_position);
                file.upload = Upload.upload({
                    url: '/employeeModified/update/' + encodeURIComponent(application) + '/update',
                    data: {file: file}
                }).success(function (data,status) {
                    window.location.reload();
                }).then(function (response) {
                    $timeout(function () {
                        file.result = response.data;
                    },7000);
                });
            };

            $scope.focusProgram = function (_id){
                if ($('#trainingProgram' + _id).is(":focus")) {
                    return;
                }
                $('#trainingProgram' + _id).dropdown('toggle');
            };

            $scope.setProgram = function (program, position) {
                $scope.employeeApplications[position].TRAINING_PROGRAM = program;
            };

            // show edit agreement panel
            $scope.showEditAgreement = function(id, position, name, program) {
                $scope.activeDateTimePicker(id, position);
                $("#editAgreementPanel" + id).dialog(
                    {
                        height: 600,
                        width: 1200,
                        modal: true,
                        buttons: {
                            "Resubmit": function() {
                                $scope.submit(id, position);
                            },

                            "Cancel": function() {
                                $( this ).dialog( "destroy" );
                            }
                        },
                        resizable: false,
                        open: function (event, ui) {
                            $(".ui-dialog-titlebar-close", $(this).parent()).hide();
                            $(".ui-dialog-buttonset>button").blur();
                            $(".ui-dialog-title").html(name+ " - " + program);
                            $http({
                                method: 'post',
                                url: '/approve/getScannings/' + id,
                                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                            }).success(function (response) {
                                $scope.employeeApplications[position].picFile = response;
                            });
                        }
                    }
                );
            };

            //init the "training period from /training period to" input field to active date picker component
            $scope.activeDateTimePicker = function(_id, _position) {
                $("#trainingPeriodFrom" + _id).datetimepicker({
                    format: 'Y-m-d',
                    formatDate: 'Y-m-d',
                    timepicker: false,
                    onSelectDate: function () {
                        $("#trainingPeriodFrom" + _id).trigger("change");
                        $scope.employeeApplications[_position].TRAINING_PERIOD_FROM = $("#trainingPeriodFrom" + _id).val();
                    }
                });

                $("#trainingPeriodTo" + _id).datetimepicker({
                    format: 'Y-m-d',
                    formatDate: 'Y-m-d',
                    timepicker: false,
                    onSelectDate: function () {
                        $("#trainingPeriodTo" + _id).trigger("change");
                        $scope.employeeApplications[_position].TRAINING_PERIOD_TO = $("#trainingPeriodTo" + _id).val();
                    }
                });
            };

            //click to change color
            $scope.focusme = function (ve) {
                $('#tbodyemployee').find('tr').not(document.getElementById(ve)).css('background', '');
                $('#' + ve).css('background', '#E1E7EC');
            };

            //get comments data
            $scope.getComments = function (dataId) {
                $http({
                    method: 'get',
                    url: '/employee/comment/' + $scope.empid + '/' + $scope.empname + '/1/comment',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function (response) {
                    $scope.commentHis = response;
                }).error(function () {
                    console.log('fecth failed');
                });
                $('#emp_comhis' + dataId).toggle();
            };

            $scope.getInfo = function () {
                $http({
                    method: 'get',
                    url: '/employee/list/' + $scope.empid + '/' + $scope.empname,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function (data) {
                    console.log('data:+++++' + JSON.stringify(data))
                    if (data === '1') {
                        $('#loginoutwarn').slideDown();
                    } else if (data === '2') {
                        $('#loginoutwarn').slideDown();
                    } else {
                        $timeout(function () {
                            $scope.employeeApplications = eval(data);
                            $('#shclKeyframes').css('display', 'none');
                        }, 2000);
                    }
                }).error(function () {
                    console.log('fecth failed');
                });
            };
        }).error(function () {
        });
    }
]);

//Employee Add
employeeControllers.controller('EmployeeAddCtrl', ['$scope', '$filter', '$http', '$routeParams','Upload','$timeout',
    function ($scope, $filter, $http, $routeParams,Upload,$timeout) {
        //navigation
        $(document).mousemove(function (e) {
            document.getElementById("pagex").value = e.pageX;//pageX() 属性是鼠标指针的位置，相对于文档的左边缘。
            document.getElementById("pagey").value = e.pageY;//pageY() 属性是鼠标指针的位置，相对于文档的上边缘。
        });

        var MouseEvent = function(e){
            this.x = e.pageX;
            this.y = e.pageY;
        }

        var Mouse = function(e){
            var kdheight = jQuery(document).scrollTop();
            mouse = new MouseEvent(e);
            leftpx = mouse.x-240;
            toppx = mouse.y-70;
        }

        $(".hoverTag").hover(
            function (e) {
                Mouse(e);
                var message = e.currentTarget.firstElementChild.defaultValue;
                if(message == null || message == '' || message == undefined){
                    $(".hoverdiv").css({
                        "display": "none",
                    });
                    $("#message").html("");
                }else{
                    $(".hoverdiv").css({
                        "display": "block",
                        "top":  '200px',
                        "left": e.currentTarget.offsetLeft+e.currentTarget.offsetWidth/2,
                    });
                    $(".hoverTag h4#"+e.currentTarget.lastElementChild.id).css({
                        "color": "blue",
                    });
                    $("#message").html(message);
                }
            },
            function () {
                $(".hoverdiv").css({
                    "display": "none",
                });
                $(".hoverTag h4").css({
                    "color": "black",
                });
                $("#message").html("");
            }
        )

        //submit
        $scope.submit = function(file) {
            $scope.submitted = true;
            if ($scope.checkDisplay() === "block")
                return;
            var application = $scope.toJSON();
            file.upload = Upload.upload({
                url: '/employeeAdd/save/' + encodeURIComponent(application) + '/save',
                data: {file: file},
            }).success(function (data,status) {
                window.location.href = "/";
            }).then(function (response) {
                $timeout(function () {
                    file.result = response.data;
                },7000);
            });
        };
        $('#addClass').attr('class', 'active');
        $('#allClass').removeAttr('class', 'active');
        $('#empClass').removeAttr('class', 'active');
        $('#approverClass').removeAttr('class', 'active');
        $('#shclKeyframes').shCircleLoader({
            keyframes: " 0%  {background:black}\
        40%  {background:transparent}\
        60%  {background:transparent}\
        100% {background:black}"
        });
        var heightOfWindow = $(document).height();
        var heightOfHeader = $("#headcon").height();
        $("body").height(heightOfWindow - 10);
        $("#containercon").height(heightOfWindow - 10 - heightOfHeader - 30);
        $('#trainingPeriodFrom').datetimepicker({
            format: 'Y-m-d',
            formatDate: 'Y-m-d',
            timepicker: false,
            onSelectDate: function () {
                $('#trainingPeriodFrom').trigger("change");
                $scope.application.TRAINING_PERIOD_FROM = $('#trainingPeriodFrom').val();
                checkTime($scope.application.TRAINING_PERIOD_FROM, $scope.application.TRAINING_PERIOD_TO);
            }
        });
        $('#trainingPeriodTo').datetimepicker({
            format: 'Y-m-d',
            formatDate: 'Y-m-d',
            timepicker: false,
            onSelectDate: function () {
                $('#trainingPeriodTo').trigger("change");
                $scope.application.TRAINING_PERIOD_TO = $('#trainingPeriodTo').val();
                checkTime($scope.application.TRAINING_PERIOD_FROM, $scope.application.TRAINING_PERIOD_TO);
            }
        });
        $("#EmployeeByAdd").height(heightOfWindow - 332);
        if ($("#EmployeeByAdd").height() < 530) {
            $("#EmployeeByAdd").height(530);
        }
        //GET ALL CERTIFICATION FROM TPT
        $http({
            method: 'JSONP',
            url: 'http://10.2.1.74:8080/tpt2013-portlet/resteasy/certification/all?callback=JSON_CALLBACK'
        }).success(function (response) {
            var allCerts = angular.fromJson(response);
            var programList = new Array();
            for (var i = 0; i < allCerts.length; i++) {
                var p = new Object();
                p.programName = allCerts[i].certificationName;
                programList.push(p);
            }
            $scope.allProgram = programList;
        }).error(function () {

        });

        $scope.role = "employee";
        $scope.warningMsg = "";
        $scope.submitted = false;
        $scope.isok = false;
        $scope.periodType = ["12 months", "6 months"];
        $scope.ccLast = "";
        $scope.allCC = [{"screenName": "CC1"}, {"screenName": "CC2"}];
        $scope.allProgram = [{"programName": "P1"}, {"programName": "P2"}, {"programName": "P3"}, {"programName": "P4"}, {"programName": "P5"}];
        $scope.application = {
            DATA_ID: "",
            EMP_NAME: getCookie('EMP_NAME'),
            EMP_ID: getCookie('EMP_ID'),
            CHINESE_NAME: "",
            IDENTIFICATION: "",
            APPROVER: "Vernon.Stinebaker",
            CC: "Iris.Luo",
            TRAINING_INSTITUTION: "",
            TRAINING_PROGRAM: "",
            TOTAL_COST: "",
            COMPANY_COVER: "",
            TRAINING_PERIOD_FROM: "",
            TRAINING_PERIOD_TO: "",
            SET_PERIOD: "",
            SERVICE_PERIOD_FROM: "",
            SERVICE_PERIOD_TO: "",
            REASON: "",
            CREATE_DATE: "",
            CREATE_BY: "",
            UPDATE_DATE: "",
            UPDATE_BY: "",
            STATUS: "submitted",
            REJECT_NOTES: "",
            COMPANY_COVER_RATE: "",
            TOTAL_COST_CN: "",
            COMPANY_COVER_CN: "",
            YEAR_CN: "",
            MONTH_CN: "",
            DAY_CN: "",
            REJECTED: "0",
            COMMENTS: "",
            COMMENTED: "0",
            certification: ""
        };

        function getCookie(c_name) {
            if (document.cookie.length > 0) {
                c_start = document.cookie.indexOf(c_name + "=")
                if (c_start != -1) {
                    c_start = c_start + c_name.length + 1
                    c_end = document.cookie.indexOf(";", c_start)
                    if (c_end == -1) c_end = document.cookie.length
                    return unescape(document.cookie.substring(c_start, c_end))
                }
            }
            return ""
        }

        $scope.checkChineseName = function (chineseName, role) {
            var ok = checkChineseName(chineseName, role);
            return ok;
        };

        $scope.checkIdNumber = function (identification, role) {
            var ok = checkIdNumber(identification, role);
            return ok;
        };

        $scope.checkMoney = function (totalCost, companyCover, role) {
            var ok = checkMoney(totalCost, companyCover, role);
            return ok;
        };

        $scope.checkTime = function (trainingPeriodFrom, trainingPeriodTo, role) {
            var ok = checkTime(trainingPeriodFrom, trainingPeriodTo, role);
            return ok;
        };

        $scope.checkAll = function (application, role) {
            var ok = checkAll(application, role);
            return ok;
        };

        $scope.checkDisplay = function () {
            $scope.warningMsg = "";
            var chineseNameCheck = $scope.checkChineseName($scope.application.CHINESE_NAME, "");
            if (chineseNameCheck !== "" && $scope.warningMsg === "")
                $scope.warningMsg = chineseNameCheck;
            var idNumberCheck = $scope.checkIdNumber($scope.application.IDENTIFICATION, "");
            if (idNumberCheck !== "" && $scope.warningMsg === "")
                $scope.warningMsg = idNumberCheck;
            var moneyCheck = $scope.checkMoney($scope.application.TOTAL_COST, $scope.application.COMPANY_COVER, "");
            if (moneyCheck !== "" && $scope.warningMsg === "")
                $scope.warningMsg = moneyCheck;
            var timeCheck = $scope.checkTime($scope.application.TRAINING_PERIOD_FROM, $scope.application.TRAINING_PERIOD_TO, "");
            if (timeCheck !== "" && $scope.warningMsg === "")
                $scope.warningMsg = timeCheck;
            if ($scope.submitted) {
                var allCheck = $scope.checkAll($scope.application, "");
                if (allCheck !== "") {
                    if ($scope.warningMsg === "")
                        $scope.warningMsg = allCheck;
                } else
                    $scope.submitted = false;
            }
            if ($scope.isok && $scope.warningMsg === "") {
                $('#trainingProgram').css("border-color", "red");
                $scope.warningMsg = "Your application of the training program already exists";
            }
            if ($scope.warningMsg === "")
                return "none";
            return "block";
        };

        $scope.change = function () {
            $('#trainingProgram').css("border-color", "");
            $scope.isok = false;
        };

        $scope.toJSON = function () {
            $scope.application.REASON = $scope.application.REASON.replace(/\\/g, 'exchangesprit');
            $scope.application.REASON = $scope.application.REASON.replace(/\//g, 'exchangeversprit');
            $scope.application.REASON = $scope.application.REASON.replace(/\n/g, 'exchangeenter');
            $scope.application.REASON = $scope.application.REASON.replace(/\r/g, 'exchanger');
            $scope.application.REASON = $scope.application.REASON.replace(/\"/g, 'exchangeyin');
            $scope.application.TRAINING_INSTITUTION = $scope.application.TRAINING_INSTITUTION.replace(/\"/g, 'exchangeyin');
            $scope.application.TRAINING_INSTITUTION = $scope.application.TRAINING_INSTITUTION.replace(/\\/g, 'exchangesprit');
            $scope.application.TRAINING_INSTITUTION = $scope.application.TRAINING_INSTITUTION.replace(/\//g, 'exchangeversprit');
            $scope.application.TRAINING_PROGRAM = $scope.application.TRAINING_PROGRAM.replace(/\"/g, 'exchangeyin');
            $scope.application.TRAINING_PROGRAM = $scope.application.TRAINING_PROGRAM.replace(/\\/g, 'exchangesprit');
            $scope.application.TRAINING_PROGRAM = $scope.application.TRAINING_PROGRAM.replace(/\//g, 'exchangeversprit');
            var application = $filter('json')($scope.application);
            return application;
        };

        $scope.reasonLeft = function () {
            return 500 - $scope.application.REASON.length;
        };

        $scope.setProgram = function (program) {
            $scope.application.TRAINING_PROGRAM = program;
        };

        $scope.checkFloat = function (ve) {
            IsFloat(ve);
        };

        $scope.checkAngelMoney = function (ve) {
            AngelMoney(ve);
        };

        $scope.focusProgram = function (ve){
            if($('#trainingProgram').is(":focus")) {
                return;
            }
            $('#trainingProgram').dropdown('toggle');
        };

    }
]);

//admin get allList
employeeControllers.controller('AllListCtrl', ["$scope", "$http", "$timeout", "$location",
    function ($scope, $http, $timeout, $location) {
        $('#allClass').attr('class', 'active');
        $('#empClass').removeAttr('class', 'active');
        $('#addClass').removeAttr('class', 'active');
        $('#approverClass').removeAttr('class', 'active');
        $scope.pageNumber = 1;
        $scope.periodType = [
            {text: "6 months", value: "6"},
            {text: "12 months", value: "12"}
        ];

        $http({
            method: 'post',
            url: '/getTotalPage/getTotal',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (response) {
            $scope.AllSum = response.count;
            $scope.totalPage = response.totalPage;
        });
        $('#prevPageBtn').attr("disabled", "true");

        //init admin's index lists
        $http({
            method: 'get',
            url: '/getFirstPage/first',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (response) {
            $scope.AllApplications = response;
        }).error(function () {
            console.log('fecth failed');
        });

        $scope.focusProgram = function (emp_id){
            $('#trainingProgram' + emp_id).dropdown('toggle');
        };

        $scope.commentCharactersLeft = function(_position) {
            return 500 - $scope.AllApplications[_position].COMMENTS.length;
        };

        // show edit agreement panel
        $scope.showEditAgreement = function(id, position, name, program) {
            $scope.activeDateTimePicker(id, position);
            $("#editAgreementPanel" + id).dialog(
                {
                    height: 600,
                    width: 1200,
                    modal: true,
                    buttons: {
                        "Accept": function() {
                            $http({
                                method: 'get',
                                url: '/admin/updateStatus/' + id +'/accept',
                                params:{"serviceFrom":$("#servicePeriodFrom" + id).val(),"serviceTo":$("#servicePeriodTo" + id).val()},
                                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                            }).success(function (response) {
                                window.location.reload();
                            });
                        },
                        "Reject": function() {
                            $http({
                                method: 'get',
                                url: '/admin/updateStatus/' + id +'/reject',
                                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                            }).success(function (response) {
                                window.location.reload();
                            });
                        },
                        "Cancel": function() {
                            $( this ).dialog( "destroy" );
                        }
                    },
                    resizable: false,
                    open: function (event, ui) {
                        $(".ui-dialog-titlebar-close", $(this).parent()).hide();
                        $(".ui-dialog-buttonset>button").blur();
                        $(".ui-dialog-title").html(name+ " - " + program);
                        $http({
                            method: 'post',
                            url: '/approve/getScannings/' + id,
                            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                        }).success(function (response) {
                            $scope.AllApplications[position].picFile = response;
                        });
                    }
                }
            );
        };

        //init the "service period from" input field to active date picker component
        $scope.activeDateTimePicker = function(_id, _position) {
                  $("#servicePeriodFrom" + _id).datetimepicker({
                      format: 'Y-m-d',
                      formatDate: 'Y-m-d',
                      timepicker: false,
                      onSelectDate: function () {
                          $("#servicePeriodFrom" + _id).trigger("change");
                          $scope.AllApplications[_position].SERVICE_PERIOD_FROM = $("#servicePeriodFrom" + _id).val();
                          $scope.periodValidityChange(_id, _position);
                          $scope.$apply();
                      }
                  });
        };

        // init "period of validity" select value
        $scope.initSelectPeriod = function(trainingPeriodTo, servicePeriodTo) {
            var trainingTo = Date.parse(trainingPeriodTo)/1000;
            var serviceTo = Date.parse(servicePeriodTo)/1000;
            var interval = Math.floor((serviceTo - trainingTo) / (3600 * 24 * 30));
            return isNaN(interval) || (interval !== 6 && interval !== 12) ? '6' : interval + '';
        };

        // After "period of validity" field changed
        $scope.periodValidityChange = function(_id, _position) {
            // if "Service Period" field is not filled
            if ($scope.AllApplications[_position].SERVICE_PERIOD_FROM === "") {
                return;
            }
            var interval = parseInt($("#setperiod" + _id).val());
            var date = new Date($("#servicePeriodFrom" + _id).val());
            date.setDate(date.getDate() - 1);
            var serviceStartMonth = date.getMonth() + 1;
            var serviceEndMonth = serviceStartMonth + interval;
            var carryover = serviceEndMonth > 12 ? Math.ceil(serviceEndMonth / 12 - 1) : 0;

            // process single digit
            serviceEndMonth = serviceEndMonth % 12 === 0 ? 12 : serviceEndMonth % 12;
            serviceEndMonth = serviceEndMonth < 10 ? "0" + serviceEndMonth : serviceEndMonth;

            var serviceEndTime = (date.getFullYear() + carryover) + "-" + serviceEndMonth +
                "-" + (date.getDate() < 10 ? "0" + date.getDate() : date.getDate());

            $scope.AllApplications[_position].SERVICE_PERIOD_TO = serviceEndTime;
        };

        //next page
        $scope.nextPage = function () {
            var nextPage = $scope.pageNumber + 1;
            $http({
                method: 'get',
                url: '/nextPage/' + nextPage,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function (response) {
                if (response.length === 0) {
                    $('#nextPageBtn').attr("disabled", "true");
                }
                else if (response.length <= 9) {
                    $('#nextPageBtn').attr("disabled", "true");
                    $scope.pageNumber++;
                    $scope.AllApplications = response;
                }
                else {
                    $('#prevPageBtn').removeAttr("disabled");
                    $scope.pageNumber++;
                    $scope.AllApplications = response;
                }
            }).error(function () {
                console.log('fecth failed');
            });
        };

        //previou page
        $scope.prevPage = function () {
            var prevPage = $scope.pageNumber - 1;
            $http({
                method: 'post',
                url: '/prevPage/' + prevPage + '/previous',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function (response) {
                if ($scope.pageNumber === 1) {
                    $scope.AllApplications = response;
                    $('#prevPageBtn').attr("disabled", "true");
                    $('#nextPageBtn').removeAttr("disabled");
                }
                else {
                    $scope.AllApplications = response;
                    $('#nextPageBtn').removeAttr("disabled");
                }
            }).error(function () {
                console.log('fecth failed');
            });
            $scope.pageNumber--;
        };

        //go to first page
        $scope.firstPage = function () {
            $http({
                method: 'post',
                url: '/firstPage/1/first',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function (response) {
                $scope.AllApplications = response;
                $('#nextPageBtn').removeAttr("disabled");
                $('#prevPageBtn').attr("disabled", "true");
                $scope.pageNumber = 1;
            }).error(function () {
                console.log('fecth failed');
            });
        };

        //go to last page
        $scope.lastPage = function () {
            $http({
                method: 'post',
                url: '/lastPage/last',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                params: {"AllSum": $scope.AllSum}
            }).success(function (response) {
                $scope.AllApplications = response;
                $('#nextPageBtn').attr("disabled", "true");
                $('#prevPageBtn').removeAttr("disabled");
                $scope.pageNumber = $scope.totalPage;
            }).error(function () {
                console.log('fecth failed');
            });
        };


        //get info
        $scope.getInfo = function () {
            $http({
                method: 'get',
                url: '/getFirstPage/first',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function (data) {
                if (data === '1') {
                    $('#loginoutwarn').slideDown();
                } else if (data === '2') {
                    $('#loginoutwarn').slideDown();
                } else {
                    $scope.AllApplications = eval(data);
                    $timeout(function () {
                        $('#shclKeyframes').css('display', 'none');
                    }, 2000);
                }
            }).error(function () {

            });
        };
    }
]);
//approver list
employeeControllers.controller("ApproverListCtrl",["$scope", "$http", "$timeout", "$location",
    function ($scope, $http, $timeout) {
        $('#empClass').removeAttr('class', 'active');
        $('#allClass').removeAttr('class', 'active');
        $('#addClass').removeAttr('class', 'active');
        $('#approverClass').attr('class', 'active');
        $('#emplisttab_pending').attr('class', 'active');
        $('#emplisttab_approved').removeAttr('class', 'active');
        $scope.pageNumber = 1;
        $http({
            method: 'post',
            url: '/approve/getTotalPage/getTotal?status=pending',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (response) {
            $scope.AllSum = response.count;
            $scope.totalPage = response.totalPage;
            if($scope.totalPage === 1){
                $('#prevPageBtn').attr("disabled", "true");
                $('#nextPageBtn').attr("disabled", "true");
            }else
                $('#prevPageBtn').attr("disabled", "true");
        });

        //init approver's index lists
        $http({
            method: 'post',
            url: '/approve/getFirstPage/first?status=pending',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (response) {
            $scope.AllApplications = response;
        }).error(function () {
            console.log('fecth failed');
        });
        //next page
        $scope.nextPage = function () {
            var nextPage = $scope.pageNumber + 1;
            var status;
            if($('#emplisttab_pending').hasClass('active')){
                status = 'pending'
            }
            if($('#emplisttab_approved').hasClass('active')){
                status = 'approved'
            }
            $http({
                method: 'post',
                url: '/approve/nextPage/' + nextPage+'?status=' + status,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function (response) {
                if (response.length === 0) {
                    $('#nextPageBtn').attr("disabled", "true");
                }
                else if (response.length <= 9) {
                    $('#nextPageBtn').attr("disabled", "true");
                    $('#prevPageBtn').removeAttr("disabled");
                    $scope.pageNumber++;
                    $scope.AllApplications = response;
                }
                else {
                    $('#prevPageBtn').removeAttr("disabled");
                    $scope.pageNumber++;
                    $scope.AllApplications = response;
                }
            }).error(function () {
                console.log('fecth failed');
            });
        };

        //previou page
        $scope.prevPage = function () {
            var prevPage = $scope.pageNumber - 1;
            var status;
            if($('#emplisttab_pending').hasClass('active')){
                status = 'pending'
            }
            if($('#emplisttab_approved').hasClass('active')){
                status = 'approved'
            }
            $http({
                method: 'post',
                url: '/approve/prevPage/' + prevPage+"?status=" + status,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function (response) {
                if ($scope.pageNumber === 1) {
                    $scope.AllApplications = response;
                    $('#prevPageBtn').attr("disabled", "true");
                    $('#nextPageBtn').removeAttr("disabled");
                }
                else {
                    $scope.AllApplications = response;
                    $('#nextPageBtn').removeAttr("disabled");
                }
            }).error(function () {
                console.log('fecth failed');
            });
            $scope.pageNumber--;
        };

        //go to first page
        $scope.firstPage = function () {
            var status;
            if($('#emplisttab_pending').hasClass('active')){
                status = 'pending'
            }
            if($('#emplisttab_approved').hasClass('active')){
                status = 'approved'
            }
            $http({
                method: 'post',
                url: '/approve/firstPage/?status=' + status,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function (response) {
                $scope.AllApplications = response;
                $('#nextPageBtn').removeAttr("disabled");
                $('#prevPageBtn').attr("disabled", "true");
                $scope.pageNumber = 1;
            }).error(function () {
                console.log('fecth failed');
            });
        };

        //go to last page
        $scope.lastPage = function () {
            var status;
            if($('#emplisttab_pending').hasClass('active')){
                status = 'pending'
            }
            if($('#emplisttab_approved').hasClass('active')){
                status = 'approved'
            }
            $http({
                method: 'post',
                url: '/approve/lastPage',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                params: {"AllSum": $scope.AllSum,"status": status}
            }).success(function (response) {
                $scope.AllApplications = response;
                $('#nextPageBtn').attr("disabled", "true");
                $('#prevPageBtn').removeAttr("disabled");
                $scope.pageNumber = $scope.totalPage;
            }).error(function () {
                console.log('fecth failed');
            });
        };
        // approver view agreement panel
        $scope.showEditAgreement = function (id, name, program, status) {
            if (status === 'Approved') {
                $("#editAgreementPanel" + id).dialog(
                    {
                        height: 600,
                        width: 1200,
                        modal: true,
                        buttons: {
                            "Cancel": function () {
                                $(this).dialog("destroy");
                            }
                        },
                        resizable: false,
                        open: function (event, ui) {
                            $(".ui-dialog-titlebar-close", $(this).parent()).hide();
                            $(".ui-dialog-buttonset>button").blur();
                            $(".ui-dialog-title").html(name + " - " + program);
                            $http({
                                method: 'post',
                                url: '/approve/getScannings/' + id,
                                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                            }).success(function (response) {
                                $scope.picFile = response;
                            });
                        }
                    }
                );
            } else {
                $("#editAgreementPanel" + id).dialog(
                    {
                        height: 600,
                        width: 1200,
                        modal: true,
                        buttons: {
                            "Approve": function () {
                                $http({
                                    method: 'post',
                                    url: '/approve/' + id + '/approved',
                                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                                }).success(function (response) {
                                    window.location.reload();
                                    console.log('approve success');
                                });
                                $(this).dialog("destroy");
                            },
                            "Disapprove": function () {
                                $http({
                                    method: 'post',
                                    url: '/approve/' + id + '/reject',
                                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                                }).success(function (response) {
                                    window.location.reload();
                                });
                                $(this).dialog("destroy");
                            },
                            "Cancel": function () {
                                $(this).dialog("destroy");
                            }
                        },
                        resizable: false,
                        open: function (event, ui) {
                            $(".ui-dialog-titlebar-close", $(this).parent()).hide();
                            $(".ui-dialog-buttonset>button").blur();
                            $(".ui-dialog-title").html(name + " - " + program);
                            $http({
                                method: 'post',
                                url: '/approve/getScannings/' + id,
                                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                            }).success(function (response) {
                                $scope.picFile = response;
                            });
                        }
                    }
                );
            }
        };
        //approver view the pdf
        $scope.viewFile = function (ve) {
            window.open("approve/viewScanning/viewFile?="+ve.file);
        }
        //click 'Pending' href
        $scope.approverPending = function () {
            $('#emplisttab_pending').attr('class', 'active');
            $('#emplisttab_approved').removeAttr('class', 'active');
            $http({
                method: 'post',
                url: '/approve/getFirstPage/first?status=pending',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function (response) {
                $scope.AllApplications = response;
                $('#prevPageBtn').attr("disabled", "true");
                $('#nextPageBtn').removeAttr("disabled", "true");
            }).error(function () {
                console.log('fecth failed');
            });
            $scope.pageNumber = 1;
            $http({
                method: 'post',
                url: '/approve/getTotalPage/getTotal?status=pending',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function (response) {
                $scope.AllSum = response.count;
                $scope.totalPage = response.totalPage;
                if($scope.totalPage === 1 ){
                    $('#prevPageBtn').attr("disabled", "true");
                    $('#nextPageBtn').attr("disabled", "true");
                }else
                    $('#prevPageBtn').attr("disabled", "true");
            });
        }
        //click 'Approved' href
        $scope.approverApproved = function () {
            $('#emplisttab_pending').removeAttr('class', 'active');
            $('#emplisttab_approved').attr('class', 'active');
            $http({
                method: 'post',
                url: '/approve/getFirstPage/first?status=approved',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function (response) {
                $scope.AllApplications = response;
                $('#prevPageBtn').attr("disabled", "true");
                $('#nextPageBtn').removeAttr("disabled", "true");
            }).error(function () {
                console.log('fecth failed');
            });
            $scope.pageNumber = 1;
            $http({
                method: 'post',
                url: '/approve/getTotalPage/getTotal?status=approved',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function (response) {
                $scope.AllSum = response.count; 
                $scope.totalPage = response.totalPage;
                if($scope.totalPage === 1){
                    ('#prevPageBtn').attr("disabled", "true");
                    ('#nextPageBtn').attr("disabled", "true");
                }else
                    $('#prevPageBtn').attr("disabled", "true");
            });
        }
    }
]);