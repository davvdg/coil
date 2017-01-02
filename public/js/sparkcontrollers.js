'use strict';

angular.module('myApp.sparkcontrollers', [])
  .controller("SparkDriverCtrl", function($scope, $http, $routeParams) {
  self.status = {};
  self.load = function() {
    $http.get('/api/driver/'+self.driverid+'/status')
    .then(
      // on success
      function(res) {
        self.status = res.data;
      }, 
      // on error
      function(res) {
        console.log(res);
      });
  }
  self.load();
  })
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
    }

    var myInterval = setInterval(self.loadJobs, 5000);
    $scope.$on("$destroy", function(){
        clearInterval(myInterval);
    });
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
    var zeros = {
        "rddBlocks" : 0,
        "memoryUsed" : 0,
        "diskUsed" : 0,
        "totalCores" : 0,
        "maxTasks" : 0,
        "activeTasks" : 0,
        "failedTasks" : 0,
        "completedTasks" : 0,
        "totalTasks" : 0,
        "totalDuration" : 0,
        "totalGCTime" : 0,
        "totalInputBytes" : 0,
        "totalShuffleRead" : 0,
        "totalShuffleWrite" : 0,
        "maxMemory" : 0,
      };

    self.totalActives = Object.create(zeros);
    self.totalDeads = Object.create(zeros);
    self.totals = Object.create(zeros);


    self.updateMetrics = function() {
      var zeros = {
        "rddBlocks" : 0,
        "memoryUsed" : 0,
        "diskUsed" : 0,
        "totalCores" : 0,
        "maxTasks" : 0,
        "activeTasks" : 0,
        "failedTasks" : 0,
        "completedTasks" : 0,
        "totalTasks" : 0,
        "totalDuration" : 0,
        "totalGCTime" : 0,
        "totalInputBytes" : 0,
        "totalShuffleRead" : 0,
        "totalShuffleWrite" : 0,
        "maxMemory" : 0,
      };

      self.totalActives = Object.create(zeros);
      self.totalDeads = Object.create(zeros);
      self.totals = Object.create(zeros);

      self.executors.forEach(
        function(executor) {
        for (var key in zeros) {
            if (executor.isActive) {
              self.totalActives[key] += executor[key];
            } else {
              self.totalDeads[key] += executor[key];
            }
            self.totals[key] += executor[key];
          }
        }
      );
    }

    self.loadExecutors = function() {
      $http.get('/api/driver/'+self.driverid+'/applications/' + self.appid + '/executors')
      .then(
        // on success
        function(res) {
          self.executors = res.data;
          self.updateMetrics();
        }, 
        // on error
        function(res) {
          console.log(res);
        });

    }
    var myInterval = setInterval(self.loadExecutors, 5000);
    $scope.$on("$destroy", function(){
        clearInterval(myInterval);
    });
    self.loadExecutors();

  });