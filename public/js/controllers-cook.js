(function() {

'use strict';



angular.module('myApp.controllers.cook', [])
  .controller("CookSubmitJobCtrl", CookSubmitJobCtrl)
  .controller("MesosUrisCtrl", MesosUrisCtrl)
  .controller("MesosVolumesCtrl", MesosVolumesCtrl)
  .controller("MesosPortsCtrl", MesosPortsCtrl)
  .controller("ItemListCtrl", ItemListCtrl);

CookSubmitJobCtrl.$inject = ['$scope', '$http', '$location', 'PersistJobsService'];

function CookSubmitJobCtrl($scope, $http, $location, PersistJobsService) {
    var vm = this;
    vm.name ="";
    vm.command ="";
    vm.priority =50;
    vm.max_retries = 1;
    vm.max_runtime = 60;
    vm.cpus = 1;
    vm.mem = 1024;
    vm.gpus = 0;
    vm.ports = 0;
    vm.uris = [];
    vm.envs = {};

    vm.useDocker = false;

    vm.container = {
    	type: "docker",
    	docker: {
    		image: "ubuntu",
    		network: "host", // or bridge
    		parameters : [],
    		"port-mapping" : []
    	},
      volumes: []
	  };

    vm.errorMessage = "";
    vm.submitError = false;

    vm.submitJob = submitJob;
    vm.loadJson = loadJson;
    vm.downloadJson = downloadJson;
    vm.clearAll = clearAll;

    var pData = PersistJobsService.getData();
    console.log(pData);
    if ( pData.cook) {
      setFromJson(pData.cook);
    }

    /////////////////////////////////////

    function prepareJson() {
    	var submitJson = {
    		jobs: []
    	}
      var job = {
        name: vm.name,
        command: vm.command,
        priority : vm.priority,
        max_retries: vm.max_retries,
        max_runtime: vm.max_runtime,
        cpus: vm.cpus,
        mem: vm.mem,
        gpus: vm.gpus,
        //ports: self.ports,
        uris: vm.uris,
        envs: vm.envs
      }

      if (vm.useDocker) {
        job["container"] = vm.container;
      }
    	submitJson.jobs.push(job);
    	return submitJson;
    }


    function submitJob() {
		  var data = prepareJson();
    	$http.post('/api/submit/cook', angular.toJson(data))
      	.then(
      	// on success
        function(res) {
          console.log("success");
          vm.submitError = false;
          vm.errorMessage = "";
          //var driverid = res.data.submissionId;
          PersistJobsService.resetData("cook");
          $location.path("/coiljobs");

        }, 
        // on error
        function(res) {
          console.log("error");
          console.log(res);
          vm.submitError = true;
          vm.errorMessage = res.data.error;
        });    	
    }

    function downloadJson() {
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

    function setFromJson(jDataAll) {
      var jData = jDataAll.jobs[0];
      vm.name = jData.name;
      vm.command = jData.command;
      vm.priority= jData.priority;
      vm.max_retries= jData.max_retries;
      vm.max_runtime= jData.max_runtime;
      vm.cpus= jData.cpus;
      vm.mem= jData.mem;
      vm.gpus= jData.gpus;
      vm.ports= jData.ports;
      vm.uris= jData.uris;
      vm.envs= jData.envs;

      if (jData.container) {
        vm.container = jData.container;
        vm.useDocker = true;
      }      
    }

    function loadJson() {
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

    		var jData = JSON.parse(data);
    		console.log(jData);
        PersistJobsService.setData('cook', jData);
        setFromJson(jData);
    		$scope.$apply();    
          //send your binary data via $http or $resource or do anything else with it
        }
        r.readAsText(f);
  		}
    }

    function clearAll() {
    	vm.name ="";
	    vm.command ="";
	    vm.priority =50;
	    vm.max_retries = 1;
	    vm.max_runtime = 60;
	    vm.cpus = 1;
	    vm.mem = 1024;
	    vm.gpus = 0;
	    vm.ports = 0;
	    vm.uris = [];
	    vm.envs = {};
      vm.useDocker = false;
      vm.container = {};
      PersistJobsService.resetData("cook");
    }

    $scope.$on('$locationChangeStart', function(event, next, current) {
      var jData = prepareJson();
      console.log(jData);
      PersistJobsService.setData('cook', jData);
    });
  }
  

function MesosUrisCtrl() {
	var vm = this;
	vm.rows = [];
	vm.newRow = {};
  vm.addRow = addRow;
  vm.delRow = delRow;

  createNewRow();

  ////////////////////////

	function createNewRow() {
		vm.newRow = {
			value: "",
			executable: false,
			extract: false,
			cache: false
		}
	}

	function validateNewRow() {
		return vm.newRow.value !== "";
	}

	function addRow() {
		if (validateNewRow()) {
  		vm.rows.push(vm.newRow);
  		createNewRow();
	  }
	}

	function delRow(idx) {
		vm.rows.splice(idx, 1);
	}
}

function MesosVolumesCtrl() {
	var vm = this;
	vm.rows = [];
	vm.newRow = {};
  vm.addRow = addRow;
  vm.delRow = delRow;

  /////////////////////////

  createNewRow();

	function createNewRow() {
		vm.newRow = {
			host_path: "",
			container_path: "",
			mode: "rw"
		}
	}

	function validateNewRow() {
		return (vm.newRow.host_path !== "") && (vm.newRow.container_path !== "");
	}

	function addRow() {
		if (validateNewRow()) {
  		vm.rows.push(vm.newRow);
  		createNewRow();
	  }
	}
	
  function delRow(idx) {
		vm.rows.splice(idx, 1);
	}

}

function MesosPortsCtrl() {
	var vm = this;
	vm.rows = [];
	vm.newRow = {};
  vm.addRow = addRow;
  vm.delRow = delRow;

  createNewRow();
	
  //////////////////////

  function createNewRow() {
		vm.newRow = {
			host_port: "",
			container_port: "",
			protocol: "tcp"
		}
	}

	function validateNewRow() {
		return (vm.newRow.host_port !== "") && (vm.newRow.container_port !== "");
	}

	function addRow() {
		if (validateNewRow()) {
  		vm.rows.push(vm.newRow);
  		createNewRow();
	  }
	}

	function delRow(idx) {
		vm.rows.splice(idx, 1);
	}
	
}

function ItemListCtrl() {
  	var vm = this;
  	vm.rows = [];
  	vm.newRow = "";
    vm.addRow = addRow;
    vm.delRow = delRow;

    createNewRow();

    ////////////////////////

  	function createNewRow() {
  		vm.newRow = ""
  	}
  	
    function validateNewRow() {
  		return (vm.newRow !== "");
  	}

  	function addRow() {
  		if (validateNewRow()) {
	  		vm.rows.push(vm.newRow);
	  		createNewRow();
		  }
  	}

  	function delRow(idx) {
  		vm.rows.splice(idx, 1);
  	}
  	
  }

})();