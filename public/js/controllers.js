'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('AppCtrl', function ($scope, $http) {

    $http({
      method: 'GET',
      url: '/api/name'
    }).
    then(function (data, status, headers, config) {
      $scope.name = data.name;
    }, function (data, status, headers, config) {
      $scope.name = 'Error!';
    });
  }).
  controller('JobCtrl', function ($scope, $http) {
    $scope.mainClass = "";
    $scope.arguments = "";
    $scope.ressource = "";
    $scope.confs = {};
    $scope.envs = {};
    $scope.errorMessage = "";
    // write Ctrl here
    $scope.submitJob = function() {

      var data = {
        "appResource": $scope.ressource,
        "mainClass": $scope.mainClass,
        "appArgs": $scope.arguments.split(" "),
        "sparkProperties" : $scope.confs,
        "environmentVariables": $scope.envs
      }
      console.log($scope);
      console.log(data);
      $http.post('/api/submit', data)
      .then(
        // on success
        function(res) {
          $scope.errorMessage = res.data.message;
        }, 
        // on error
        function(res) {
          console.log(res);
          $scope.errorMessage = res.data;
        });


    }

  }).
  controller("ConfCtrl", function() {
    this.confs = {};
    this.confsKeys = [];
    this.keyToAdd = '';
    this.valueToAdd = '';
    var self = this;

    self.simulateQuery = false;
    self.isDisabled    = false;

    // list of `state` value/display objects
    

    this.setFieldKeys = function() {
        this.confsKeys = Object.keys(this.confs)
    }

    this.addConf = function() {
      console.log(this);
      if (this.keyToAdd == "" || this.valueToAdd == "") {
        return;
      }


      this.confs[this.keyToAdd] = this.valueToAdd;
      this.setFieldKeys();
      this.keyToAdd = '';
      this.valueToAdd = '';
    }
    this.delConf = function(key) {
      delete this.confs[key];
      this.setFieldKeys();
    }

    this.querySearch = function(query) {
      var results = query ? self.states.filter( self.createFilterFor(query) ) : self.states,
          deferred;
      if (self.simulateQuery) {
        deferred = $q.defer();
        $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
        return deferred.promise;
      } else {
        return results;
      }
    }

    this.searchTextChange = function(text) {
      this.keyToAdd = text;
      //console.log('Text changed to ' + text);
    }

    this.selectedItemChange = function(item) {
      console.log('Item changed to ' + JSON.stringify(item));
      //this.keyToAdd = item;
    }

    this.createFilterFor = function(query) {
      var lowercaseQuery = angular.lowercase(query);

      return function filterFn(state) {
        return (state.value.indexOf(lowercaseQuery) === 0);
      };

    }

    this.loadAll = function() {
      var allStates = ['spark.app.name',
       'spark.driver.cores',
       'spark.driver.maxResultSize',
       'spark.driver.memory', 
       'spark.executor.memory',
       'spark.extraListeners',
       'spark.local.dir',
       'spark.logConf',
       'spark.master',
       'spark.submit.deployMode',
       'spark.driver.extraClassPath',
       'spark.driver.extraJavaOptions',
       'spark.driver.extraLibraryPath',
       'spark.driver.userClassPathFirst',
       'spark.executor.extraClassPath',
       'spark.executor.extraJavaOptions',
       'spark.executor.extraLibraryPath',
       'spark.executor.logs.rolling.maxRetainedFiles',
       'spark.executor.logs.rolling.enableCompression',
       'spark.executor.logs.rolling.maxSize',
       'spark.executor.logs.rolling.strategy',
       'spark.executor.logs.rolling.time.interval',
       'spark.executor.userClassPathFirst',
       'spark.executorEnv.',
       'spark.python.profile',
       'spark.python.profile.dump',
       'spark.python.worker.memory',
       'spark.python.worker.reuse',
       'spark.files',
       'spark.submit.pyFiles',
       'spark.jars',
       'spark.jars.packages',
       'spark.jars.excludes',
       'spark.jars.ivy',
       'spark.reducer.maxSizeInFlight',
       'spark.reducer.maxReqsInFlight',
       'spark.shuffle.compress',
       'spark.shuffle.file.buffer',
       'spark.shuffle.io.maxRetries',
       'spark.shuffle.io.numConnectionsPerPeer',
       'spark.shuffle.io.preferDirectBufs',
       'spark.shuffle.io.retryWait',
       'spark.shuffle.service.enabled',
       'spark.shuffle.service.port',
       'spark.shuffle.sort.bypassMergeThreshold',
       'spark.shuffle.spill.compress',
       'spark.eventLog.compress',
       'spark.eventLog.dir',
       'spark.eventLog.enabled',
       'spark.ui.killEnabled',
       'spark.ui.port',
       'spark.ui.retainedJobs',
       'spark.ui.retainedStages',
       'spark.ui.retainedTasks',

       'spark.mesos.coarse',
       'spark.mesos.extra.cores',
       'spark.mesos.mesosExecutor.cores',
       'spark.mesos.executor.docker.image',
       'spark.mesos.executor.docker.volumes',
       'spark.mesos.executor.docker.portmaps',
       'spark.mesos.executor.home',
       'spark.mesos.executor.memoryOverhead',
       'spark.mesos.uris',
       'spark.mesos.principal',
       'spark.mesos.secret',
       'spark.mesos.role',
       'spark.mesos.constraints',
       'spark.mesos.driver.webui.url',
       'spark.mesos.dispatcher.webui.url'];

      return allStates.map( function (state) {
        return {
          value: state.toLowerCase(),
          display: state
        };
      });
    }
self.states        = this.loadAll();

    this.setFieldKeys();
  }).
  controller('MyCtrl2', function ($scope) {
    // write Ctrl here

  })
  .controller("LoginCtrl", function ($scope, $location, AuthService) {

    $scope.login = function () {

      // initial values
      $scope.error = false;
      $scope.disabled = true;

      // call login from service
      AuthService.login($scope.loginForm.username, $scope.loginForm.password)
      
        // handle success
        .then(function () {
          $location.path('/');
          $scope.disabled = false;
          $scope.loginForm = {};
        }, 
        // handle error
        function () {
          $scope.error = true;
          $scope.errorMessage = "Invalid username and/or password";
          $scope.disabled = false;
          $scope.loginForm = {};
        });
    };

  }).controller('LogoutCtrl', function ($scope, $location, AuthService) {

      $scope.logout = function () {

        // call logout from service
        AuthService.logout()
          .then(function () {
            $location.path('/login');
          });

      };

  }).controller('NavCtrl', function($scope, AuthService) {
  });
/*

'{
  "action" : "CreateSubmissionRequest",
  "appArgs" : [ "myAppArgument1" ],
  "appResource" : "file:/myfilepath/spark-job-1.0.jar",
  "clientSparkVersion" : "1.5.0",
  "environmentVariables" : {
    "SPARK_ENV_LOADED" : "1"
  },
  "mainClass" : "com.mycompany.MyJob",
  "sparkProperties" : {
    "spark.jars" : "file:/myfilepath/spark-job-1.0.jar",
    "spark.driver.supervise" : "false",
    "spark.app.name" : "MyJob",
    "spark.eventLog.enabled": "true",
    "spark.submit.deployMode" : "cluster",
    "spark.master" : "spark://spark-cluster-ip:6066"
  }
}'
*/