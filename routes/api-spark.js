var http = require("http");
var querystring = require("querystring");
var config = require("../configMgmt.js").config;
var request = require('request');
var rp = require('request-promise');
var Promise = require('promise');
var uuid = require('uuid/v4');
var url = require('url');
var db = require('../db.js');

var frameworkId = null;

exports.submitSparkjob = function(req,res) {
	var user = req.session.passport.user.username;

	var newbody = req.body;
	var jobuuid = uuid();
	newbody.action = "CreateSubmissionRequest";
	newbody.clientSparkVersion = "2.0.2";
	if (newbody.sparkProperties["spark.app.name"]===undefined) {
		newbody.sparkProperties["spark.app.name"] = "unamedJob";
	}
	newbody.environmentVariables["COIL_UUID"] = jobuuid;
    console.log(newbody);	
	var _res=res;
	/*
	var options = {
	  hostname: config.spark.url,
	  port: config.spark.port,
	  path: '/v1/submissions/create',
	  method: 'POST',
	  headers: {
	      'Content-Type': 'application/json;charset=UTF-8',
	  },
	};
	*/
	var options = {
	  uri: 'http://'+ config.spark.url + ':' + config.spark.port + '/v1/submissions/create',
	  method: 'POST',
	  headers: {
	      'Content-Type': 'application/json'
	  },
	  json: true, 
	  body: newbody
	};
	var proxyreq = request(options, function(error, response, body) {
		if (!error) {
			var job = {
				uuid: jobuuid,
				submissionDate: Date.now(),
				user: user,
				type: "spark",
				internalId: body.submissionId,
				submissionCmd: JSON.stringify(req.body, null, 2),
				runs : []
			}
			db.storeJob(job);
	    	_res.json(job);
		} else {
			console.log('problem with request: ' + error.message);
	  		_res.json(error);		
		}
	});
	return proxyreq;
};

exports.killJob = function(req, res) {
	var driver = req.params.driverid;
	killSparkjob(driver)
	.on('error', function(err) {
    	console.log(err)
    	res.json(err);
    })
    .pipe(res);
}

exports.getDriverStatus = function(req, res) {
	var _res=res;
	var driver = req.params.driverid;
	var options = {
	  uri: 'http://'+ config.spark.url + ':' + config.spark.port + '/v1/submissions/status/' + driver,
	};
	//console.log(options);
	request(options, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			data = parseSparkDispatcherRawDatas(body);
			_res.json(data);
		} else {
			_res.json({state: "error"});
		}
	});
}

var getSparkJobStatus = function(job) {
	var sparkToCoiljobStatusMap = {
		QUEUED: "PENDING",
		RUNNING: "RUNNING",
		FINISHED: "DONE"
	}
	var driverid = job.internalId;
	var options = {
	  uri: 'http://'+ config.spark.url + ':' + config.spark.port + '/v1/submissions/status/' + driverid,
	};
	//console.log(options);
	var promise = rp(options)
	.then(function(data) {
		var d = JSON.parse(data);
		return sparkToCoiljobStatusMap[d.driverState];
	});	
	return promise;
}

var getSparkJobRunData = function(job) {
	var mesosToRunStatusMap= {
		TASK_FAILED:"FAILED",
		TASK_RUNNING:"RUNNING",
		TASK_COMPLETE:"COMPLETE"
	}


	var driverid = job.internalId;
	var options = {
	  uri: 'http://'+ config.spark.url + ':' + config.spark.port + '/v1/submissions/status/' + driverid,
	};
	//console.log(options);
	var promise = rp(options)
	.then(function(data) {
		var d = JSON.parse(data);
		var parsedData = parseSparkDispatcherRawDatas(data);
		var mesosStatusMappedToCoil = mesosToRunStatusMap[parsedData.state];
		//console.log(JSON.stringify(parsedData, null, 2));
		var path = computePathUrl(parsedData.slave_id.value, driverid);
		var runMsg = [{ 
			host: parsedData.container_status.network_infos.ip_addresses.ip_address,
			task_id: driverid,
			status: mesosStatusMappedToCoil,
			outputUrl: path
		}];
		return runMsg;
	})
	.catch(function(err) {
		console.log(err);
	});	
	return promise;

}

var computePathUrl = function(slaveId, driverId) {
	var path = "/var/lib/mesos/slave/slaves/" + slaveId + "/frameworks/" + frameworkId + "/executors/" + driverId + "/runs/latest";
	//var epath =querystring.escape(path);
	return path;
}

var killSparkjob = function(driverid, promise=false) {	
	var newUrl = 'http://'+ config.spark.url + ':' + config.spark.port + '/v1/submissions/kill/' + driverid;
	var options = {
		url:'http://'+ config.spark.url + ':' + config.spark.port + '/v1/submissions/kill/' + driverid,
		method: "POST"
	}
	var ret = undefined;
	if (promise) {
		ret = rp(options);
		return ret
	}
	ret = request(options);
	return ret;
}


var killCoilSparkJob = function(job) {
	var driverid = job.internalId;
	var p = killSparkjob(driverid, true).
		then(
			function(data) {
				var data = JSON.parse(data);
				if (data.success === false) {
					return Promise.reject({
						error: "Unable to kill Spark driver id "+ driverid + " : " + data.message
					})
				} else {
					return Promise.resolve(data);
				}				
			}
		);
	return p;
}

var parseSparkDispatcherRawDatas = function (datas) {
	var jmessage = {"state": "FAILED_PARSING"};
	var jdata = JSON.parse(datas);
	var rawmessage = "" + jdata.message;
	//console.log(rawmessage);

	var dataMatches = rawmessage.match(/data\:\s.*\n/g); // remove data field for special parsing...
	rawmessage = "{" + rawmessage + "}"
	/*
	var message = rawmessage.
					replace(/\n(\s*[a-z0-9_]*)\s\{/g, '\n$1: {').
					replace(/\}\n([a-z0-9_]+)/g, "},\n$1").
					replace(/([a-z0-9A-Z_\"]+)(\n\s*[a-z0-9_\"]+)/g, '$1,$2').
					replace(/([a-z0-9_]+)\:/g, '"$1":').
					replace(/\:\s([A-Z0-9_.]+)/g, ': "$1"').
					replace(/\"uuid\"\:\s.*\n/g, ''); // @todo: escape the uuid
					*/
	var message = rawmessage
	.replace(/uuid.*\n/g, '') 										// remove uuid
	.replace(/data.*\n/g, '')
	.replace(/([0-9a-z_]+)\s\{/g,'"$1": \{') 						// task_id { to task_id: {
	.replace(/([0-9a-z_]+)\:\s\"(.*)\"\n/g, '"$1": "$2"\n') 		// task_id: "blablabla" to "task_id": "blablabla"
	.replace(/\n(\s*[0-9a-z_]+)\:\s([A-Z_]+)/g, '\n"$1": "$2"')		// task_id: BLA_BLA_BLA to "task_id": "BLA_BLA_BLA"
	.replace(/\n(\s*[0-9a-z_]+)\:\s([0-9]+[\.]*[0-9A-Z]*)/g, '\n"$1": $2') // task_id: 1.12563E9 to "task_id": 1.12563E9
	.replace(/([\}\"0-9]+)\n\"/g, '$1,\n\"')
	.replace(/\\/g, '');						// ...} or ...' at end of line with '... on next line to ...},"... or ...","...


	//message = message.replace(/\"data\"\:\s(.*)\n/g, '');
					
					//replace(/\}\,\n(\s*)/g, '}\n$1');
	//message = "{" + message + "}"
	try {
		jmessage = JSON.parse(message);
	} catch (e) {
		console.log(message);
		console.log(e);
	}
	
	if (dataMatches) {
    	if (dataMatches.length) {
    		//console.log(dataMatches[0]);
    		//console.log(dataMatches[1]);
    		var data0 = dataMatches[0].
    			replace(/[^\\]\"/g, '').
    			replace(/\\sha25\:[0-9a-f]*/g, '\\"').
    			replace(/data\:(.*)/g, "$1").
    			replace(/\\n/g, '\n').
    			replace(/\\"/g, '"').
    			replace(/\\"/g, '\"');    		
    		var completedDatas = '{ "data": ' + data0.slice(0, -2) + '}';
    		//console.log(completedDatas.slice(11080,11090));
    		try {
				var jcompletedDatas = JSON.parse(completedDatas);
    			jmessage["data"] = jcompletedDatas.data;
    		} catch (e) {
    			console.log(jcompletedDatas);
    			console.log(e);
    		}

    	}
	}
	return jmessage;
}
    	
var getDriverIpPortFromRawDatas= function(rawDatas) {
	parsedData = parseSparkDispatcherRawDatas(rawDatas);
	if (parsedData.state !== "FAILED_PARSING") {
		return parsedData.container_status.network_infos.ip_addresses.ip_address + ":4040";
	}
	return "";
}

var getDriverIpPort = function(driver) {
	var options = {
	  uri: 'http://'+ config.spark.url + ':' + config.spark.port + '/v1/submissions/status/' + driver,
	};
	//console.log(options);
	var promise = rp(options)
    .then(getDriverIpPortFromRawDatas)
    .catch(function (err) {
    	console.log(err);
        // API call failed... 
    });
    return promise;
}




var getDriverIpPortFromJob = function(driverjob) {
	var driver = jobCache[driverjob].driver;
	var options = {
	  uri: 'http://'+ config.spark.url + ':' + config.spark.port + '/v1/submissions/status/' + driver,
	};
	//console.log(options);
	var promise = rp(options)
    .then(getDriverIpPortFromRawDatas)
    .catch(function (err) {
    	console.log(err);
        // API call failed... 
    });
    return promise;
}
exports.proxyDriverJob = function(req,res) {	
	var driverjob = req.params.driverid;

	getDriverIpPortFromJob(driverjob).then(function(ip) {
		if (ip !== "") {
			var newUrl = "http://" + ip + "/"
			request(newUrl).
			on('error', function(err) {
    			console.log(err)
    			res.body(err);
    		}).
			pipe(res);
		} else {
			res.body("failed to get driver's ip");
		}
	}).catch(function(err) {
		res.body = err;
	});
}

/**
Given a driver id, this function will find the internal host:port running the driver
And will pass all requests to it.
This may need a specific driver url configuration to work.
**/
exports.proxyDriver = function(req,res) {	
	var driver = req.params.driverid;
	var fullPath = url.parse(req.url).path;
	var proxyPath = fullPath.match(/\/drivergui\/driver\-[0-9]*\-[0-9]*(.*)/)[1]
	getDriverIpPort(driver).then(function(ip) {
		if (ip !== "") {
			var newUrl = "http://" + ip + proxyPath;
			console.log(newUrl);
			request(newUrl).
			on('error', function(err) {
    			console.log(err)
    			res.json(err);
    		}).
			pipe(res);
		} else {
			res.body("failed to get driver's ip");
		}
	}).catch(function(err) {
		res.body = err;
	});
}

exports.proxyDriverApi = function(req,res) {	
	var driver = req.params.driverid;
	var fullPath = url.parse(req.url).path;
	var proxyPath = fullPath.match(/\/api\/driver\/driver\-[0-9]*\-[0-9]*(.*)/)[1]
	getDriverIpPort(driver).then(function(ip) {
		if (ip !== "") {
			var newUrl = "http://" + ip + "/api/v1" + proxyPath;
			console.log(newUrl);
			request(newUrl).
			on('error', function(err) {
    			console.log(err)
    			res.json(err);
    		}).
			pipe(res);
		} else {
			res.body("failed to get driver's ip");
		}
	}).catch(function(err) {
		res.body = err;
	});
}

exports.getDriverList = function(req, res) {
	res.json(jobCache);
}

var cheerio = require("cheerio");

exports.parseDriverPage = function() {
	var options = {
	  uri: 'http://'+ config.spark.url + ':' + config.spark.port,
	};
	//console.log(options);
	var promise = rp(options)
    .then(function(data) {
    	var $ = cheerio.load(data);
    	// capture the framework id
    	var pSS = $('p');
    	var pSStext = pSS.map(function(idx, elem) {
    		return $(elem).text();
    	}).get();
    	var mframework = data.match(/Mesos\sFramework\sID\:\s([a-f0-9\-]*)/);

    	frameworkId = mframework[1];

    	// detect all a href. they link to driver infos
    	var aSS = $('a');
    	var aSStext = aSS.map(function(idx, elem) {
    		return $(elem).text();
    	}).get();
    	var driverList = aSStext.filter(function(elem) {
    		if (elem.match(/driver\-[0-9]*-[0-9]*/)) {
    			return true;
    		} else {
    			return false;
    		}
    	});
    	driverList.forEach(function(elem) {
    		db.getJobByInternalIds(elem)
    		.then( 
    			function(data) {
    				if (data.length === 0) {
			    		var jobuuid = uuid();
			    		var job = {
							uuid: jobuuid,
							internalId: elem,
							submissionDate: Date.now(),
							user: "unknow",
							type: "spark",
							runs: []
						}
						db.storeJob(job);						
    				} else {
    					console.log("job " + elem + "already in db. skipping");
    				} 				
    			})
    		.catch(
    			function(err) {
    				console.log("failed to get job by id" + elem  + ":" + err);
    			}
    		);
    	})
    })
    .catch(function (err) {
    	console.log(err);
        // API call failed... 
    });
}

db.registerJobType("spark", {
	statusCb: getSparkJobStatus,
	runsCb: getSparkJobRunData,
	killCb: killCoilSparkJob
});



