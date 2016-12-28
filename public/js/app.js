'use strict';

// Declare app level module which depends on filters, and services

angular.module('myApp', [
  'ngMaterial',
  'ngRoute',
  'myApp.controllers',
  'myApp.sparkcontrollers',
  'myApp.controllers.cook',
  'myApp.controllers.spark',
  'myApp.controllers.coil',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  //'myApp.sparksdirectives',
]).
config(function ($routeProvider, $locationProvider) {
  $routeProvider.
    when('/', {
      templateUrl: 'partials/home.html',
    }).
    when('/login', {
      templateUrl: 'partials/login.html',
      controller: 'LoginCtrl'
    }).
    when('/logout', {
      controller: 'LogoutCtrl'
    }).
    when('/createjob/spark', {
      templateUrl: 'partials/spark/create_job_spark.tmpl.html',
      controller: 'SparkSubmitJobCtrl',
      controllerAs: 'ctrl'
    }).
    when('/createjob/cook', {
      templateUrl: 'partials/create_job_cook.tmpl.html',
      controller: 'CookSubmitJobCtrl',
      controllerAs: 'ctrl'
    }).    
    when('/driver', {
      templateUrl: 'partials/drivers.tmpl.html',
      controller: 'DriversCtrl'
    }).
    when('/driver/:driverid', {
      templateUrl: 'partials/driversdetails.tmpl.html',
    }).
    when('/driver/:driverid/applications', {
      templateUrl: 'partials/applications.tmpl.html'
    }).
    when('/driver/:driverid/applications/:appid', {
      templateUrl: 'partials/application.tmpl.html'
    }).
    when('/driver/:driverid/applications/:appid/executors', {
      templateUrl: 'partials/executors.tmpl.html'
    }).
    when('/coiljobs', {
      templateUrl: 'partials/coiljobs.tmpl.html'
    }).
    when('/coiljobs/:jobid', {
      templateUrl: 'partials/coiljob.tmpl.html'
    }).
    when('/coiljobs/:jobid/runs/:runid/files', {
      templateUrl: 'partials/coiljob_run_browse.tmpl.html',
      controller: 'CoilRunLogBrowserCtrl',
      controllerAs: 'ctrl'
    }).            
    otherwise({
      redirectTo: '/'
    });

  $locationProvider.html5Mode(true);
}).run(function ($rootScope, $location, $route, AuthService) {
  $rootScope.$on('$routeChangeStart',
    function (event, next, current) {
    AuthService.getUserStatus()
    .then( function() {
      if (AuthService.isLoggedIn() === false) {
        $location.path('/login');
      };
    }, function(res) {
      console.log(res);
    });
  });
});