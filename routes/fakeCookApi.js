var http = require("http");
var querystring = require("querystring");
var config = require("../configMgmt.js").config;
var request = require('request');
var rp = require('request-promise');
var uuid = require('uuid/v4');
var url = require('url');
var db = require('../db.js');
var Promise = require('promise');

var oldjobuuid = uuid();
var frameworkUuid = uuid();
var slaveUuid = uuid();
var executor_id = uuid();

var jobStatus = ["waiting", "running", "completed"];
var instanceStatus = ["unknown", "running", "success", "failed"];

var fakeJobStatus = {
	uuid: oldjobuuid,
	cpus: 1,
	mem: 1024,
	gpus: 0,
	framework_id: frameworkUuid,
	status: "waiting",
	instances : []
}

var jobInstance = {
	start_time: 0,
	end_time: 0,
	task_id: 0,
	hostname: "192.168.0.23",
	ports: 0,
	slave_id: slaveUuid,
	executor_id, executor_id,
	status: "unknown",
	output_url: ""
}

exports.postCookJobs = function(req, res) {
	var user = req.session.passport.user.username;
	var newbody = req.body;
	var jobs = newbody.jobs;
	jobs.forEach(function(elem) {
		var jobuuid = uuid();
		elem["uuid"] = jobuuid;
		elem.envs["COIL_UUID"] = jobuuid;
	});
    console.log(newbody);	

	var _res=res;
	var options = {
	  hostname: config.cook.url,
	  port: config.cook.port,
	  path: '/rawscheduler',
	  method: 'POST',
	  headers: {
	      'Content-Type': 'application/json;charset=UTF-8',
	  },
	};
	console.log(newbody.jobs.length);
	if (newbody.jobs.length===0) {
		res.status(400).json({
			error: "malformed request: no jobs"
		});
		return;
	} else {
		console.log(newbody.jobs[0].name);
		if (newbody.jobs[0].name === "malformed") {
			console.log("malformed");
			res.status(400).json({
				error: "malformed request: fake malformed"
			});
			return;
		}
		if (newbody.jobs[0].name === "unauthorized") {
			res.status(402).json({
				error: "unauthorized: fake unauthorized"
			});
			return;
		}
		if (newbody.jobs[0].name === "unprocessable") {
			res.status(422).json({
				error: "Unprocessable Entity : Returned if there is an error committing jobs to the Cook database."
			});
			return;
		}
	}


	var fakerequest = function() {
	  	var jobs = newbody.jobs;
		jobs.forEach(function(elem) {
			//jobCache[elem.uuid] = elem;
			var job = {
						uuid: elem.uuid,
						payload: elem,
						submissionDate: Date.now(),
						user: user,
						type: "cook"
					}
			db.storeJob(job);
		});
		res.status(201);
	    res.json(newbody);
	};

	fakerequest();
	// write data to request body
	//proxyreq.write(JSON.stringify(newbody));
	//proxyreq.end(JSON.stringify(newbody));	
	
}

var getJobStatus = function(uuid) {
	var status = {
		uuid: oldjobuuid,
		cpus: 1,
		mem: 1024,
		gpus: 0,
		framework_id: frameworkUuid,
		status: "waiting",
		instances : []
	};
	status.uuid = uuid;
	console.log(status);
	var promise = new Promise(
		function (resolve, reject) {
			setTimeout(function() {
				resolve(status);
			}, 1000);
		}
	);	
	
	return promise;
}

exports.deleteKillCookJobs = function(res, res) {
	res.json({});
}

exports.postRetryCookJob = function(res, res) {
	res.json({});
}

//db.registerJobType("cook", {statusCb:getJobStatus})