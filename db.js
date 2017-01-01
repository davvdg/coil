var config = require("./configMgmt.js").config;
var db = require('./controllers/db-local.js');
var Promise = require('promise');

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

exports.getJobRunsByJobUuid = function(uuid) {
	return db.getJobByUuid(uuid).then(
		function(job) {
			console.log(job);
			return Promise.resolve(job.runs);
		}
	);	
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

var p_syncJobStatusFromFrameworkToDb = function(job) {
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


var p_getRunsFromFramework = function(job) {
	var jobType = job.type;
	var runsCb = coilJobTypes[jobType].runsCb
	var p = runsCb(job)
	return p;	
}

var p_syncRunsStatusFromFrameworkToDb = function(job) {
	var p = p_getRunsFromFramework(job);
	p.then(
		function(data) {
			return db.setRuns(job, data);
		});
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
				error = "";
				jobs.forEach(
					function(job) {
						p_syncJobStatusFromFrameworkToDb(job)
						.then(function(data) {
							clients.forEach(function(client) {
								client.emit('job:changedStatus', {
									uuid: job.uuid,
									status: job.status
								});
							})
						}, function(err) {
							error = "ERROR syncing Job Status to DB";
						});
						p_syncRunsStatusFromFrameworkToDb(job)
						.then(function(data) {
							clients.forEach(function(client) {
								client.emit('job:changedRunsStatus', {
									uuid: job.uuid,
									runs: job.runs
								})
							})
						})
						.catch(function(err) {
							error = "ERROR syncing Runs Status to DB";
						});
					}
				);
				if (error !== "") {
					throw error;
				}
			}
		).catch(
			function(err) {
				console.log("error retrieving uncompleted jobs");
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