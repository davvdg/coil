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
    var prepareJson= function($scope) {
      var data = {
        "appResource": $scope.ressource,
        "mainClass": $scope.mainClass,
        "appArgs": $scope.arguments.split(" "),
        "sparkProperties" : $scope.confs,
        "environmentVariables": $scope.envs
      }
      console.log($scope);
      console.log(data);
      return data;    
    }

    $scope.submitJob = function() {
      var data = prepareJson($scope);

      $http.post('/api/submit', data)
      .then(
        // on success
        function(res) {
          console.log(res);
          $scope.errorMessage = res.data.message;
        }, 
        // on error
        function(res) {
          console.log(res);
          $scope.errorMessage = res.data;
        });
    }

    $scope.downloadJson = function() {
      var data = prepareJson($scope);
    
      var filename = 'job.json';

      if (typeof data === 'object') {
        data = JSON.stringify(data, undefined, 2);
      }

      var blob = new Blob([data], {type: 'text/json'});

  // FOR IE:

      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(blob, filename);
      }
      else{
          var e = document.createEvent('MouseEvents'),
              a = document.createElement('a');

          a.download = filename;
          a.href = window.URL.createObjectURL(blob);
          a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
          e.initEvent('click', true, false, window,
              0, 0, 0, 0, 0, false, false, false, false, 0, null);
          a.dispatchEvent(e);
      }
    }

    $scope.loadJson = function(){
      var f = document.getElementById('file').files[0];
      console.log(f);
      var self = $scope;
      console.log(self);
      var r = new FileReader();
      r.onloadend = function(e){
        var data = e.target.result;
        
        var jData = JSON.parse(data);
        console.log(jData);
        console.log(self);
        self.ressource = jData.appResource;
        self.arguments = jData.appArgs.join(" ");
        self.mainClass = jData.mainClass;
        self.confs = jData.sparkProperties;
        self.envs =jData.environmentVariables;
        self.$apply();    
        //send your binary data via $http or $resource or do anything else with it
      }
      r.readAsText(f);
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
    this.setconfs= function(confs) {
        this.confs = confs
        this.setFieldKeys();
        this.$apply();
    };

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
    var self = this;
    self.isLoggedIn = function() {
      return AuthService.isLoggedIn();
    }
    self.getUserName = function() {
      return AuthService.getUserName();
    }    
  }).controller('DriversCtrl', function($scope, $http) {
    var self = this;
    self.drivers = {};
    self.driversKeys = [];
    self.setDrivers = function(driversObject) {
      self.drivers = driversObject;
      self.driversKeys = Object.keys(self.drivers);
      self.$apply();
    };
    self.loadDrivers = function() {
      $http.get('/api/driver/list')
      .then(
        // on success
        function(res) {
          console.log(res);
          self.setDrivers(res.data);
        }, 
        // on error
        function(res) {
          console.log(res);
        });
    }

    self.guiKillDriver = function(driverCoilJob) {
      if (confirm("Are you sure you want to kill this driver ????")) {
        var driver = self.drivers[driverCoilJob].driver;
          // todo code for deletion
        $http.post('/api/driver/kill/' + driver)
          .then(
            function(res) {
              console.log(res);              
            }, 
            function(res) {
              console.log(res);
            });
      }
    }

    self.loadDrivers();   
  }).controller('DriverCtrl', function($scope, $http, $routeParams) {
    self.driverID = $routeParams.id;
    self.details = "";
    console.log(self.driverID);
    self.setDriverInfos = function(driverDetails) {
      self.details = JSON.stringify(driverDetails);
      self.$apply();
      console.log(self);
    }   
    self.loadDriverInfos = function() {
      if (self.driverID !== "") {
        $http.get('/api/driver/status/' + self.driverID)
        .then(
        // on success
        function(res) {
          console.log(res.data);
          self.setDriverInfos(res.data);
        }, 
        // on error
        function(res) {
          console.log(res);
        });
      }
    }
    self.loadDriverInfos();
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