'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('AppCtrl', function ($scope, $http) {

    $http({
      method: 'GET',
      url: '/api/name'
    }).
    success(function (data, status, headers, config) {
      $scope.name = data.name;
    }).
    error(function (data, status, headers, config) {
      $scope.name = 'Error!';
    });

  }).
  controller('JobCtrl', function ($scope, $http) {
    $scope.mainClass = "";
    $scope.arguments = [];
    $scope.ressource = "";
    // write Ctrl here
    $scope.submitJob = function() {

      var data = {
        "appResource": $scope.ressource,
        "mainClass": $scope.mainClass,
        "appArgs": $scope.arguments,
        "sparkProperties" : {},
        "environmentVariables":{}
      }
      console.log($scope);
      data.sparkProperties = $scope.$$childTail.confs;
      console.log(data);
      $http.post('/api/submit', data);


    }

  }).
  controller("ConfCtrl", function($scope) {
    $scope.confs = {};
    $scope.confsKeys = [];
    $scope.keyToAdd = '';
    $scope.valueToAdd = '';

    $scope.setFieldKeys = function() {
        $scope.confsKeys = Object.keys($scope.confs)
    }

    $scope.addConf = function() {
      if ($scope.keyToAdd == "" || $scope.valueToAdd == "") {
        return;
      }


      $scope.confs[$scope.keyToAdd] = $scope.valueToAdd;
      $scope.setFieldKeys();
      $scope.keyToAdd = '';
      $scope.valueToAdd = '';
    }
    $scope.delConf = function() {
      delete $scope.confs[this.key];
      $scope.setFieldKeys();
    }
    
    $scope.setFieldKeys();
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