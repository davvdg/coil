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
      $http.post('/api/submit', data);


    }

  }).
  controller("ConfCtrl", function() {
    this.confs = {};
    this.confsKeys = [];
    this.keyToAdd = '';
    this.valueToAdd = '';

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