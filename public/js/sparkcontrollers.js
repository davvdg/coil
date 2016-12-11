'use strict';

angular.module('myApp.sparkcontrollers', [])
  .controller("SparkApplicationsCtrl", function($scope, $http, $routeParams) {
    var self = this;
    self.driverid = $routeParams.driverid;
    self.applications = [];
    self.load = function() {
      $http.get('/api/driver/'+self.driverid+'/applications')
      .then(
        // on success
        function(res) {
          self.applications = res.data;
        }, 
        // on error
        function(res) {
          console.log(res);
        });
    }
    self.load();
  })
  .controller("SparkApplicationCtrl", function($scope, $http, $routeParams, $timeout) {
    var self = this;
    self.driverid = $routeParams.driverid;
    self.appid = $routeParams.appid;
    self.name = "";
    self.attempts = [];
    self.jobs = [];
    self.limit = 20;
    self.start = 0;

    self.loadAppInfo = function() {
      $http.get('/api/driver/'+self.driverid+'/applications')
      .then(
        // on success
        function(res) {
          var applications = res.data;
          var application = applications.find(function(elem){
            return elem.id === self.appid;
          })
          self.name = application.name;
          self.attempts = application.attempts;
        }, 
        // on error
        function(res) {
          console.log(res);
        });
    }


    self.loadJobs = function() {
      $http.get('/api/driver/'+self.driverid+'/applications/' + self.appid + '/jobs')
      .then(
        // on success
        function(res) {
          self.jobs = res.data;
          console.log(res.data);
        }, 
        // on error
        function(res) {
          console.log(res);
        });
      $timeout(function(){
        self.loadJobs();
      },5000)
    }

    self.loadAppInfo();
    self.loadJobs();
  })
  .controller("SparkStagesCtrl", function($scope) {

  })
  .controller("SparkStageCtrl", function($scope) {

  })
  .controller("SparkExecutorsCtrl", function($scope, $http, $routeParams, $timeout) {
    var self = this;
    self.driverid = $routeParams.driverid;
    self.appid = $routeParams.appid;
    self.name = "";
    self.executors = [];
    self.limit = 20;
    self.start = 0;


    self.loadExecutors = function() {
      $http.get('/api/driver/'+self.driverid+'/applications/' + self.appid + '/executors')
      .then(
        // on success
        function(res) {
          self.executors = res.data;
        }, 
        // on error
        function(res) {
          console.log(res);
        });
      $timeout(function(){
        self.loadExecutors();
      },5000)
    }

    self.loadExecutors();

  });