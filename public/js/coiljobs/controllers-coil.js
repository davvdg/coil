(function() {


'use strict';


angular
	.module('myApp.coiljobs', [])
	.controller('CoilJobsCtrl', CoilJobsCtrl)
	.controller('CoilJobCtrl', CoilJobCtrl)
	.controller("CoilRunLogBrowserCtrl", CoilRunLogBrowserCtrl);

CoilRunLogBrowserCtrl.$inject = ["$routeParams", "coilDataService"];

function CoilRunLogBrowserCtrl($routeParams, coilDataService) {

	var vm = this;
	vm.jobid = $routeParams.jobid;
	vm.runid = $routeParams.runid;
	vm.path = "/"
	vm.items = [];

	vm.goToPath = goToPath;
	vm.downloadFile = downloadFile;
	vm.doAction = doAction;

	load();

	//////////////

    function load() {
      coilDataService.getJobRunFiles(vm.jobid, vm.runid, vm.path)
      .then(
        function(res) {
          vm.items = res.data;
        },
        function(err) {
          console.log(err);
        }
      );
    }

    function goToPath(path) {
    	vm.path = path;
    	load();
    }

    function downloadFile(path) {
    	coilDataService.downloadFile(vm.jobid, vm.runid, path);
    }

    function doAction(item) {
    	if (item.nlink === 1) {
    		downloadFile(item.path);
    	} else {
    		goToPath(item.path);
    	}
    }
}

CoilJobsCtrl.$inject = ["socket", "coilDataService"];

function CoilJobsCtrl(socket, coilDataService) {

	var vm = this;
	vm.jobs = [];
	vm.page = 1;
	vm.perPage = 30;

	load();

	//////////////

	function load() {
	  coilDataService.getJobs()
	  .then(
	    function(res) {
	      vm.jobs = res.data;
	    },
	    function(err) {
	      console.log(err);
	    }
	  );
	}

	socket.on('job:changedStatus', function (info) {
	  vm.jobs.forEach(function(job) {
	    if (job.uuid === info.uuid) {
	      job.status = info.status;
	    }
	  })
	});
}

CoilJobCtrl.$inject = ["$routeParams", "socket", "$location", "PersistJobsService", "coilDataService"];

function CoilJobCtrl($routeParams, socket, $location, PersistJobsService, coilDataService) {
	var vm = this;
	vm.uuid = $routeParams.jobid;

	vm.data = {};
	vm.runs = [];
	vm.errorMessage = null;
	vm.kill = kill;
	vm.copyJob = copyJob;

	load();

	//////////////

	function load() {
	  coilDataService.getJob(vm.uuid)
	  .then(
	    function(res) {
	      console.log(res.data);
	      vm.data = res.data;
	      vm.runs = res.data.runs;
	    },
	    function(err) {
	      console.log(err);
	    }
	  );
	}

	function kill() {
	  coilDataService.killJob(vm.uuid)
	  .then(
	    function(res) {
	      console.log(res.data);
	    }
	  ).catch(
	  function(err) {
	    console.log(err);
	    vm.errorMessage = err.data.error;
	  });
	  
	}

	socket.on('job:changedStatus', function (info) {
	  var msgJobUuid = info.uuid;
	  var ctrlJobUuid = vm.data.uuid
	  if (msgJobUuid === ctrlJobUuid) {
	    vm.data.status = info.status;
	  }
	});

	function copyJob() {
	  var jobTypeRoutes = {
	    spark: "/createjob/spark",
	    cook: "/createjob/cook"
	  }
	  var jobType = vm.data.type;
	  var route = jobTypeRoutes[jobType];
	  if (route) {
	    if (vm.data.submissionCmd) {
	      PersistJobsService.setData(jobType, JSON.parse(vm.data.submissionCmd));
	      $location.path(route);  
	    } else {
	      vm.errorMessage = "Error: no submission command recorded for this job (maybe too old ?)";
	    }        
	  } else {
	    vm.errorMessage = "Error: job type unknown. Cannot route to submit page";
	  }
	}
}

})();