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
  controller("ConfCtrl", function($scope) {
    this.confs = {};
    this.confsKeys = [];
    this.keyToAdd = '';
    this.valueToAdd = '';
    var self = this;

    self.simulateQuery = false;
    self.isDisabled    = false;
    $scope.$watch(angular.bind(this, function () {
      return this.confs;
    }), function (newVal) {
      self.setFieldKeys();
      console.log('Name changed to ' + newVal);
    });

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
        $http.post('/api/driver/'+driver+'/kill' )
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
    var self = this;
    self.driverID = $routeParams.driverid;
    self.details = "";
    self.state = "UNKNOWN";
    console.log(self.driverID);
    self.setDriverInfos = function(driverDetails) {
      self.state = driverDetails.state;
      self.details = JSON.stringify(driverDetails, null, 2);
      self.$apply();
    }   
    self.loadDriverInfos = function() {
      if (self.driverID !== "") {
        $http.get('/api/driver/'+ self.driverID +'/status' )
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
  }).controller('CoilJobsCtrl', function($scope, $http, $routeParams, socket){
    var self = this;
    self.jobs = [];
    self.page = 1;
    self.perPage = 30;
    self.load = function() {
      $http.get('/api/coiljobs')
      .then(
        function(res) {
          self.jobs = res.data;
        },
        function(err) {
          console.log(err);
        }
      );
    }
    socket.on('job:changedStatus', function (info) {
      self.jobs.forEach(function(job) {
        if (job.uuid === info.uuid) {
          job.status = info.status;
        }
      })
    });

    self.load(); 
  }).controller('CoilJobCtrl', function($scope, $http, $routeParams, socket, $location, PersistJobsService){
    var self = this;
    self.uuid = $routeParams.jobid;

    self.data = {};
    self.runs = [];
    self.errorMessage = null;

    self.load = function() {
      $http.get('/api/coiljobs/' + self.uuid)
      .then(
        function(res) {
          console.log(res.data);
          self.data = res.data;
          self.runs = res.data.runs;
        },
        function(err) {
          console.log(err);
        }
      );
    }
    self.kill = function() {
      $http.delete('/api/coiljobs/' + self.uuid + '/kill')
      .then(
        function(res) {
          console.log(res.data);
        }
      ).catch(
      function(err) {
        console.log(err);
        self.errorMessage = err.data.error;
      });
      
    }

    socket.on('job:changedStatus', function (info) {
      var msgJobUuid = info.uuid;
      var ctrlJobUuid = self.data.uuid
      if (msgJobUuid === ctrlJobUuid) {
        self.data.status = info.status;
      }
    });

    self.copyJob = function() {
      var jobTypeRoutes = {
        spark: "/createjob/spark",
        cook: "/createjob/cook"
      }
      var jobType = self.data.type;
      var route = jobTypeRoutes[jobType];
      if (route) {
        if (self.data.submissionCmd) {
          PersistJobsService.setData(jobType, JSON.parse(self.data.submissionCmd));
          $location.path(route);  
        } else {
          self.errorMessage = "Error: no submission command recorded for this job (maybe too old ?)";
        }        
      } else {
        self.errorMessage = "Error: job type unknown. Cannot route to submit page";
      }
    }


    self.load();
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