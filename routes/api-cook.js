var http = require("http");
var querystring = require("querystring");
var config = require("../configMgmt.js").config;
var request = require('request');
var rp = require('request-promise');
var uuid = require('uuid/v4');
var url = require('url');
var db = require('../db.js');
var Promise = require('promise');

exports.postCookJobs = function(req,res) {
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
	  uri: 'http://'+ config.cook.url + ':' + config.cook.port + '/rawscheduler',
	  method: 'POST',
	  headers: {
	      'Content-Type': 'application/json'
	  },
	  json: true, 
	  body: newbody
	};

	var proxyreq = request(options, function(error, response, body) {
			console.log(error);
			//console.log(response);
			//console.log(body);

		if (error) {
		  	_res.status(504).json(
				{
					error: error
				}	  		
		  	);
		} else {
			if (response.statusCode === 400) {
		  		_res.status(400).json({
		  			error: "malformed json"
		  		});
		  		return;
		  	}
		  	if (response.statusCode === 401) {
		  		_res.status(402).json({
		  			error: "user is not authorized to submit to cook"
		  		});
		  		return;
		  	}
		  	if (response.statusCode === 422) {
		  		_res.status(422).json({
		  			error: "cook is not able to store job datas (unprocessable)"
		  		});
		  		return;
		  	}
		  	if (response.statusCode ===201) {
		  		
			  	var jobs = newbody.jobs;
				jobs.forEach(function(elem) {
					var job = {
						uuid: elem.uuid,
						payload: elem,
						submissionDate: Date.now(),
						user: user,
						type: "cook",
						internalId: elem.uuid,
						submissionCmd: JSON.stringify(req.body, null, 2)
					}
					db.storeJob(job);
				});	  	
		    	_res.status(200).json(newbody);
		    	return;
		  	}
		  	_res.status(response.statusCode).json(
				{
					error: response.body
				}	  		
		  	);
		}
	})
};


var getCoilCookJobStatus = function(job) {
	var uuid = job.internalId;
	return getCookJobStatus(uuid);
}

var getCookJobStatus = function(uuid) {
	var cookToCoilStatusMap = {
		waiting: "PENDING",
		running: "RUNNING",
		completed: "DONE"
	}

	var options = {
	  uri: 'http://'+ config.cook.url + ':' + config.cook.port + '/rawscheduler?job=' + uuid,
	};
	//console.log(options);
	var promise = rp(options)
	.then(function(data) {
		return cookToCoilStatusMap[data.status];
	}).catch(function(err) {
		// for some reason, we were unabled to get the job status.
		return Promise.resolve("LOST");
	});
    return promise;
}

var killCookJob = function(uuid) {
	var options = {
	  uri: 'http://'+ config.cook.url + ':' + config.cook.port + '/rawscheduler?job=' + uuid,
	  method: 'DELETE'
	};
	var promise = rp(options);
    return promise;
}

var killCoilCookJob = function(job) {
	var cookId = job.internalId;
	var p = killCookJob(cookId).
		then(
			function(data) {
				return Promise.resolve(data);
			}
		).catch(function(err) {
			console.log(err);
			// todo error:
			// 400 Malformed This will be returned if non UUID values are passed as jobs
			// 403 Forbidden This will be returned the supplied UUIDs don’t correspond to valid jobs.
			return Promise.reject({
				error: "Unable to kill Cook Job id "+ cookId + " : " + data.message
			})
		});
	return p;
}

db.registerJobType("cook", {
	statusCb:getCoilCookJobStatus,
	killCb:killCoilCookJob
});
