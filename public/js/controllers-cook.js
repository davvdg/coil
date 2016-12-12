'use strict';

angular.module('myApp.controllers.cook', [])
.controller("CookSubmitJobCtrl", function($scope, $http, $routeParams) {
    var self = this;
    self.name ="";
    self.command ="";
    self.priority ="";
    self.max_retries = "";
    self.max_runtime = "";
    self.cpus = "1";
    self.mem = "1024";
    self.gpus = "0";
    self.ports = "0";
    self.uris = "";
    self.envs = {};

    self.errorMessage = "";

    var prepareJson = function() {
    	var submitJson = {
    		jobs: []
    	}

    	submitJson.jobs.push({
    		name: self.name,
    		command: self.command,
    		priority : self.priority,
    		max_retries: self.max_retries,
    		max_runtime: self.max_runtime,
    		cpus: self.cpus,
    		mem: self.mem,
    		gpus: self.gpus,
    		ports: self.ports,
    		uris: self.uris,
    		envs: self.envs
    	});
    	return submitJson;
    }


    self.submitJob = function() {
		var data = prepareJson();
    	$http.post('/api/submit/cook', data)
      	.then(
      	// on success
        function(res) {
          console.log(res);
          //var driverid = res.data.submissionId;
          //$location.path("/drivers/" + driverid);
        }, 
        // on error
        function(res) {
          console.log(res);
          $scope.errorMessage = res.data;
        });    	
    }

    self.downloadJson = function() {
    	
    }

    self.loadJson = function() {
    	
    }

    self.clearAll = function() {
    	
    }

  })