var coilJobs = [];

exports.storeJob = function(job) {
	job.status = "Unknown";
	job.rawStatusData = {};	
	coilJobs.push(job);
}

exports.getJobsByUser = function(username) {
	return coilJobs.filter(function(elem) {
		return elem.user === username;
	});
}

exports.getJobs = function() {
	return coilJobs;
}

exports.getJobByInternalIds = function(id) {
	
}