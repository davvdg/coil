var coilJobs = [];
var coilJobTypes = {};

exports.storeJob = function(job) {
	job.status = "Unknown";
	job.rawStatusData = {};	
	console.log("db write");
	console.log(job);
	coilJobs.push(job);
	getJobsStatus(job);
}

exports.getJobsByUser = function(username) {
	return coilJobs.filter(function(elem) {
		return elem.user === username;
	});
}

exports.getJobs = function() {
	return coilJobs;
}

exports.registerJobType = function(jobType, callbacksObj) {
	coilJobTypes[jobType] = callbacksObj;
}
var getJobsStatus = function(job) {
	var jobType = job.type;
	var statusCb = coilJobTypes[jobType].statusCb
	console.log(statusCb);
	var p = statusCb(job)
	p.then(
		// success retrieving status
		function(data) {			
			job.status = data;
			console.log(data);
		},
		// failure retrieving status,
		function(error) {
			job.status = "Unknown";
		});
}