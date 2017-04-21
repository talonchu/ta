var polls = angular.module('polls', ["employeeControllers","ngRoute",'ngFileUpload'])//Specifies the Controller
    .config(['$routeProvider', '$httpProvider',function ($routeProvider) {
        $routeProvider.when('/employeelist', {
            templateUrl: '/partials/employeeList.html', controller: "EmployeeListCtrl"
        }).when('/employeeadd', {
            templateUrl: '/partials/addTraining.html', controller: "EmployeeAddCtrl"
        }).when('/alllist',{
            templateUrl: '/partials/allList.html', controller: "AllListCtrl"
        }).when('/approverlist',{
            templateUrl: '/partials/approverlist.html', controller: "ApproverListCtrl"
        }).otherwise({redirectTo: '/employeelist'});
    }]);