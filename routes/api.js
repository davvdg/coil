/*
 * Serve JSON to our AngularJS client
 */


var http = require("http");
var querystring = require("querystring");
var config = require("../configMgmt.js").config;
var request = require('request');
var rp = require('request-promise');
var uuid = require('uuid/v4');
var url = require('url');
var db = require('../db.js');

exports.name = function (req, res) {
  res.json({
    name: 'Bob'
  });
};

var jobCache = {};

var coilJobs = [];

exports.submitSparkjob = function(req,res) {
	var newbody = req.body;
	var jobuuid = uuid();
	newbody.action = "CreateSubmissionRequest";
	newbody.clientSparkVersion = "2.0.2";
	if (newbody.sparkProperties["spark.app.name"]===undefined) {
		newbody.sparkProperties["spark.app.name"] = "unamedJob";
	}
	newbody.sparkProperties["spark.mesos.driver.webui.url"] = "/drivergui/" + jobuuid;
	newbody.environmentVariables["COIL_UUID"] = jobuuid;
    console.log(newbody);	
	var _res=res;
	var options = {
	  hostname: config.spark.url,
	  port: config.spark.port,
	  path: '/v1/submissions/create',
	  method: 'POST',
	  headers: {
	      'Content-Type': 'application/json;charset=UTF-8',
	  },
	};

	var proxyreq = http.request(options, function(res) {
	  console.log('Status: ' + res.statusCode);
	  console.log('Headers: ' + JSON.stringify(res.headers));
	  res.setEncoding('utf8');
	  res.on('data', function (body) {
	  	console.log(body);
	  	jobCache[jobuuid] = {driver: body.submissionId};

	    _res.json(body);
	  });
	});

	proxyreq.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	  _res.json(e);
	});
	// write data to request body
	//proxyreq.write(JSON.stringify(newbody));
	proxyreq.end(JSON.stringify(newbody));
};

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
	/*
	var options = {
	  hostname: config.cook.url,
	  port: config.cook.port,
	  path: '/rawscheduler',
	  
	  headers: {
	      'Content-Type': 'application/json'
	  }
	};
	*/
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
						type: "cook"
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

exports.getCoilJobs = function(req, res) {
	res.json(db.getJobs());
	
}

exports.getCoilJob = function(req, res) {

}

exports.killJob = function(req, res) {
	var driver = req.params.driverid;
	var newUrl = 'http://'+ config.spark.url + ':' + config.spark.port + '/v1/submissions/kill/' + driver
	request.post(newUrl).
	on('error', function(err) {
    	console.log(err)
    	res.json(err);
    }).
	pipe(res);
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
	// while the job is not started, there is nothing to do.
	// then:
	// here we could query mesos to get the current host and attach to the sandbox.
	// we can keep polling spark dispatcher for informations about the driver.
	// when the spark application will be started, the hostname + port should become availables...
	// ok, when it starts, the message dumped is a stringyfied json.



var parseSparkDispatcherRawDatas = function (datas) {
	var jmessage = {"state": "FAILED_PARSING"};
	var jdata = JSON.parse(datas);
	var rawmessage = "\n" + jdata.message;
	//console.log(rawmessage);
	var message = rawmessage.
					replace(/\n(\s*[a-z0-9_]*)\s\{/g, '\n$1: {').
					replace(/\}\n([a-z0-9_]+)/g, "},\n$1").
					replace(/([a-z0-9A-Z_\"]+)(\n\s*[a-z0-9_\"]+)/g, '$1,$2').
					replace(/([a-z0-9_]+)\:/g, '"$1":').
					replace(/\:\s([A-Z0-9_.]+)/g, ': "$1"').
					replace(/\"uuid\"\:\s.*\n/g, ''); // @todo: escape the uuid

	var dataMatches = rawmessage.match(/data\:\s.*\n/g);

	message = message.replace(/\"data\"\:\s(.*)\n/g, '');
					
					//replace(/\}\,\n(\s*)/g, '}\n$1');
	message = "{" + message + "}"
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
    			jmessage.data = jcompletedDatas.data;
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
    		var jobuuid = uuid();
    		jobCache[jobuuid] = {driver: elem};
    	})
    })
    .catch(function (err) {
    	console.log(err);
        // API call failed... 
    });
}

// get logs from mesos...
// mounted path:
// /var/lib/mesos/slave/slaves/e9456879-2194-49fe-b79f-cf94c4d8f439-S30/frameworks/7cebff55-810c-4528-b462-473be4cb2b7f-0003/executors/driver-20161209141841-0077/runs/c668a49a-3392-4e00-892a-c1d371a5d23f:/mnt/mesos/sandbox
// '/var/lib/mesos/slave/slaves/' + slaveid + '/framework/' + frameworkid + 'executor' + driverid + '/runs/' + runid 
// slaveid = slave_id.value
// 
// task -> "frameworkid": 7cebff55-810c-4528-b462-473be4cb2b7f-0003 <--
//         "slave_id" : "e9456879-2194-49fe-b79f-cf94c4d8f439-S30", --> slave id the task is running on
//         "state" : "TASK_RUNNING",
//         "executor_id" : "",
//         "id" : "driver-20161209141841-0077" --> task id