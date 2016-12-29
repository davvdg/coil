angular
	.module('myApp.coiljobs')
	.factory('coilDataService', coilDataService);

coilDataService.$inject = ['$http'];

function coilDataService($http) {
	return {
		getJobs: getJobs,
		getJob: getJob,
		getJobRunFiles:getJobRunFiles,
		killJob: killJob
	}

	function getJobRunFiles(jobid, runid) {
		return $http.get('/api/coiljobs/'+ jobid +'/runs/'+ runid +'/browse');
    }

    function getJobs() {
		return $http.get('/api/coiljobs');
    }

    function getJob(jobid) {
    	return $http.get('/api/coiljobs/' + jobid);
    }
	
	function killJob(jobid) {
		return $http.delete('/api/coiljobs/' + vm.uuid + '/kill');
	}
}