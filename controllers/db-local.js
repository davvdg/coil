var Promise = require("promise");

var coilJobs = [];

exports.storeJob = function(job) {
	job.status = "Unknown";
	job.rawStatusData = {};	
	coilJobs.push(job);
	return new Promise(function(resolve, reject) {
		resolve();
	})
}

exports.getJobsByUser = function(username) {
	return new Promise(function(resolve, reject) {
		var f = coilJobs.filter(
			function(elem) {
				return elem.user === username;
			}
		);
		resolve(f);
	});
}

exports.getJobs = function() {
	return new Promise(function(resolve, reject) {
		resolve(coilJobs);	
	}); 
}

var getJobByUuid = function(uuid) {
	console.log(uuid);
	return new Promise(function(resolve, reject) {
		var f = coilJobs.find(
			function(elem) {
				return elem.uuid === uuid;
			}
		);
		if (f) {
			resolve(f);
		} else {
			reject();
		}
	});
}

exports.getJobByUuid = getJobByUuid;

exports.getJobRunsByJobUuid = function(uuid) {
	var p = getJobByUuid(uuid);
	p.then(
		function(data) {
			return Promise.resolve(data.runs);
		});
	return p;
}

exports.setJobStatus = function(Job, status) {
	return new Promise(function(resolve, reject) {

		var lJob = coilJobs.find(function(elem) {
			return elem.uuid === Job.uuid;
		});
		lJob.status = status;
		resolve(lJob);
	});
}

exports.getJobByInternalIds = function(id) {
	return new Promise(function(resolve, reject) {
		resolve([]);
	});
}

exports.getUncompletedJobs = function() {
	var f = coilJobs.filter(
		function(elem) {
			return (elem.status !== "DONE");
		}
	);
	return new Promise(function(resolve, reject) {
		resolve(f);
	});
}

exports.setRuns = function(Job, runs) {
	Job["runs"] = runs;
	return new Promise(function(resolve, reject) {
		resolve(Job);
	});	
}