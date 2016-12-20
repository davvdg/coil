var config = require("./configMgmt.js").config;
var db = require('./controllers/db-local.js');

if (config.database.method === "mongo") {
	db = require("./controllers/db-mongo.js");
}



var coilJobTypes = {};

exports.storeJob = function(job) {
	var Job = db.storeJob(job);
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

/*
get job status from the framework by calling the dedicated api,
then write the database with the proper status; 
*/
var getJobsStatusFromFramework = function(job) {
	var jobType = job.type;
	var statusCb = coilJobTypes[jobType].statusCb
	var p = statusCb(job)
	return p;
}

var syncJobStatusFromFrameworkToDb = function(job) {
	var p = getJobsStatusFromFramework(job);
	p.then(
		// success retrieving status. sync it.
		function(data) {
			return db.setJobStatus(job, data)
		},
		// failure retrieving status,
		function(error) {
			db.setJobStatus(job, "Unknown");
		}
	);
	return p;
}

exports.getJobByInternalIds = function(id) {
	return db.getJobByInternalIds(id);
}

exports.getUncompletedJobs = function() {
	return db.getUncompletedJobs();
}

var clients = [];
exports.subscribe = function(client) {
	clients.push(client);
}

exports.watchSchedulers = function() {
	setInterval(function() {
		db.getUncompletedJobs()
		.then(
			function(jobs) {
				jobs.forEach(
					function(job) {
						syncJobStatusFromFrameworkToDb(job)
						.then(function(data) {
							clients.forEach(function(client) {
								client.emit('job:changedStatus', {
									uuid: job.uuid,
									status: job.status
								});
							})
						});
					}
				);
			}
		).catch(
			function(err) {
				console.log(err);
			}
		)
	}, 1000);
}

var killJob = function(job) {
	var jobType = job.type;
	var killCb = coilJobTypes[jobType].killCb;
	if (killCb) {
		return killCb(job);
	}
}

exports.killCoilJobByUuid = function(id) {
	return db.getJobByUuid(id)
	.then(killJob);
}