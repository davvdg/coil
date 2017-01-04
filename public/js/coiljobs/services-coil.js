(function() {


'use strict';

angular
	.module('myApp.coiljobs')
	.factory('coilDataService', coilDataService)
	.factory('PersistJobsService', PersistJobsService);

coilDataService.$inject = ['$http'];

function coilDataService($http) {
	return {
		getJobs: getJobs,
		getJob: getJob,
		getJobRunFiles: getJobRunFiles,
		downloadFile: downloadFile,
		killJob: killJob
	}

	/////////////////////////

	function getJobRunFiles(jobid, runid, path) {
		return $http.get('/api/coiljobs/'+ jobid +'/runs/'+ runid +'/browse?path=' + path);
    }

    function downloadFile(jobid, runid, path) {
    	return $http.get('/api/coiljobs/'+ jobid +'/runs/'+ runid +'/download?path=' + path);	
    }

    function getJobs() {
		return $http.get('/api/coiljobs');
    }

    function getJob(jobid) {
    	return $http.get('/api/coiljobs/' + jobid);
    }
	
	function killJob(jobid) {
		return $http.delete('/api/coiljobs/' + jobid + '/kill');
	}
}

function PersistJobsService() {
    var job = {};
    return {
    	getData: getData,
    	setData: setData,
    	resetData: resetData
    }

    /////////////////////////
    
	function getData() {
	    //You could also return specific attribute of the form data instead
	    //of the entire data
	    return job;
	}
	function setData(key, newJobData) {
	    //You could also set specific attribute of the form data instead
	    job[key] = newJobData;
	}
	function resetData(key) {
	    //To be called when the data stored needs to be discarded
	    delete job[key];
	}
}

})();