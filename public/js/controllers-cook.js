'use strict';

angular.module('myApp.controllers.cook', [])
.controller("CookSubmitJobCtrl", function($scope, $http, $routeParams, $location) {
    var self = this;
    self.name ="";
    self.command ="";
    self.priority =50;
    self.max_retries = 1;
    self.max_runtime = 60;
    self.cpus = 1;
    self.mem = 1024;
    self.gpus = 0;
    self.ports = 0;
    self.uris = [];
    self.envs = {};

    self.useDocker = false;

    self.container = {
    	type: "docker",
    	docker: {
    		image: "ubuntu",
    		network: "host", // or bridge
    		parameters : [],
    		"port-mapping" : []
    	},
      volumes: []
	  };

    self.errorMessage = "";
    self.submitError = false;

    var prepareJson = function() {
    	var submitJson = {
    		jobs: []
    	}
      var job = {
        name: self.name,
        command: self.command,
        priority : self.priority,
        max_retries: self.max_retries,
        max_runtime: self.max_runtime,
        cpus: self.cpus,
        mem: self.mem,
        gpus: self.gpus,
        //ports: self.ports,
        uris: self.uris,
        envs: self.envs
      }

      if (self.useDocker) {
        job["container"] = self.container;
      }
    	submitJson.jobs.push(job);
    	return submitJson;
    }


    self.submitJob = function() {
		var data = prepareJson();
    	$http.post('/api/submit/cook', angular.toJson(data))
      	.then(
      	// on success
        function(res) {
          console.log("success");
          self.submitError = false;
          self.errorMessage = "";
          //var driverid = res.data.submissionId;
          $location.path("/coiljobs");

        }, 
        // on error
        function(res) {
          console.log("error");
          console.log(res);
          self.submitError = true;
          self.errorMessage = res.data.error;
        });    	
    }

    self.downloadJson = function() {
      var data = prepareJson($scope);
    
      var filename = 'job.json';

      if (typeof data === 'object') {
        data = angular.toJson(data, 2);
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

    self.loadJson = function() {
		var x = document.createElement("INPUT");
		x.setAttribute("type", "file");
		var e = document.createEvent('MouseEvents');
		e.initEvent('click', true, false, window,
		      0, 0, 0, 0, 0, false, false, false, false, 0, null);
		x.dispatchEvent(e);      
		x.onchange = function() {
		    var f = x.files[0];
		    var r = new FileReader();
		    r.onloadend = function(e) {
				var data = e.target.result;

				var jData = JSON.parse(data).jobs[0];
				console.log(jData);
				console.log(self);
				self.name = jData.name;
				self.command = jData.command;
				self.priority= jData.priority;
				self.max_retries= jData.max_retries;
				self.max_runtime= jData.max_runtime;
				self.cpus= jData.cpus;
				self.mem= jData.mem;
				self.gpus= jData.gpus;
				self.ports= jData.ports;
				self.uris= jData.uris;
				self.envs= jData.envs;

        if (jData.container) {
          self.container = jData.container;
          self.useDocker = true;
        }

				$scope.$apply();    
		      //send your binary data via $http or $resource or do anything else with it
		    }
		    r.readAsText(f);
		}
    }    	
    

    self.clearAll = function() {
    	self.name ="";
	    self.command ="";
	    self.priority =50;
	    self.max_retries = 1;
	    self.max_runtime = 60;
	    self.cpus = 1;
	    self.mem = 1024;
	    self.gpus = 0;
	    self.ports = 0;
	    self.uris = [];
	    self.envs = {};
      self.useDocker = false;
      self.container = {};
    }

  }).controller("MesosUrisCtrl", function($scope, $http, $routeParams) {
  	var self = this;
  	self.rows = [];
  	self.newRow = {};
  	self.createNewRow = function() {
  		self.newRow = {
  			value: "",
  			executable: false,
  			extract: false,
  			cache: false
  		}
  	}
  	self.validateNewRow = function() {
  		return self.newRow.value !== "";
  	}
  	self.addRow = function() {
  		if (self.validateNewRow()) {
	  		self.rows.push(self.newRow);
	  		self.createNewRow();
		}
  	}
  	self.delRow = function(idx) {
  		self.rows.splice(idx, 1);
  	}
  	self.createNewRow();
  }).controller("MesosVolumesCtrl", function($scope, $http, $routeParams) {
  	var self = this;
  	self.rows = [];
  	self.newRow = {};
  	self.createNewRow = function() {
  		self.newRow = {
  			host_path: "",
  			container_path: "",
  			mode: "rw"
  		}
  	}
  	self.validateNewRow = function() {
  		return (self.newRow.host_path !== "") && (self.newRow.container_path !== "");
  	}
  	self.addRow = function() {
  		if (self.validateNewRow()) {
	  		self.rows.push(self.newRow);
	  		self.createNewRow();
		}
  	}
  	self.delRow = function(idx) {
  		self.rows.splice(idx, 1);
  	}
  	self.createNewRow();
  }).controller("MesosPortsCtrl", function($scope, $http, $routeParams) {
  	var self = this;
  	self.rows = [];
  	self.newRow = {};
  	self.createNewRow = function() {
  		self.newRow = {
  			host_port: "",
  			container_port: "",
  			protocol: "tcp"
  		}
  	}
  	self.validateNewRow = function() {
  		return (self.newRow.host_port !== "") && (self.newRow.container_port !== "");
  	}
  	self.addRow = function() {
  		if (self.validateNewRow()) {
	  		self.rows.push(self.newRow);
	  		self.createNewRow();
		}
  	}
  	self.delRow = function(idx) {
  		self.rows.splice(idx, 1);
  	}
  	self.createNewRow();
  }).controller("ItemListCtrl", function($scope, $http, $routeParams) {
  	var self = this;
  	self.rows = [];
  	self.newRow = "";
  	self.createNewRow = function() {
  		self.newRow = ""
  	}
  	self.validateNewRow = function() {
  		return (self.newRow !== "");
  	}
  	self.addRow = function() {
  		if (self.validateNewRow()) {
	  		self.rows.push(self.newRow);
	  		self.createNewRow();
		}
  	}
  	self.delRow = function(idx) {
  		self.rows.splice(idx, 1);
  	}
  	self.createNewRow();
  });