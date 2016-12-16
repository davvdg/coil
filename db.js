var config = require("./configMgmt.js").config;
var db = require('./controllers/db-local.js');

if (config.database.method === "mongo") {
	db = require("./controllers/db-mongo.js");
}



var coilJobTypes = {};

exports.storeJob = function(job) {
	console.log(job);
	var Job = db.storeJob(job);
	console.log(Job);
}

exports.getJobsByUser = function(username) {
	return db.getJobsByUser(username);
}

exports.getJobs = function() {
	return db.getJobs();
}

exports.getJobByUuid = function(uuid) {
	return db.getJobByUuid(uuid);
}

exports.setJobStatus = function(job, status) {
	return db.setJobStatus(job, status);
}

exports.registerJobType = function(jobType, callbacksObj) {
	coilJobTypes[jobType] = callbacksObj;
}

var getJobsStatus = function(job) {
	var jobType = job.type;
	var statusCb = coilJobTypes[jobType].statusCb
	var p = statusCb(job)
	p.then(
		// success retrieving status
		function(data) {			
			return db.setJobStatus(job, data)			
		},
		// failure retrieving status,
		function(error) {
			db.setJobStatus(job, "Unknown");
		}
	)
	return p;
}

exports.getJobByInternalIds = function(id) {
	return db.getJobByInternalIds(id);
}

exports.getUncompletedJobs = function() {
	return db.getUncompletedJobs();
}

exports.watchSchedulers = function() {
	setInterval(function() {
		db.getUncompletedJobs()
		.then(
			function(jobs) {
				jobs.forEach(getJobsStatus);
			}
		).catch(
			function(err) {
				console.log(err);
			}
		)
	}, 1000);
}