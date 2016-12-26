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

exports.getJobByUuid = function(uuid) {
	return new Promise(function(resolve, reject) {
		var f = coilJobs.filter(
			function(elem) {
				return elem.uuid === uuid;
			}
		);
		resolve(f);
	});
}

exports.setJobStatus = function(Job, status) {
	return new Promise(function(resolve, reject) {

		var lJob = coilJobs.findOne(function(elem) {
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