/*
 * Serve JSON to our AngularJS client
 */


var http = require("http");
var querystring = require("querystring");
var config = require("../configMgmt.js").config;
var request = require('request');
var rp = require('request-promise');
var uuid = require('uuid/v4');


exports.name = function (req, res) {
  res.json({
    name: 'Bob'
  });
};

var jobCache = {};

exports.submitjob = function(req,res) {
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

exports.killJob = function(req, res) {
	var driver = req.params.id;
	var newUrl = 'http://'+ config.spark.url + ':' + config.spark.port + '/v1/submissions/kill/' + driver
	request.post(newUrl).
	on('error', function(err) {
    	console.log(err)
    	res.body(err);
    }).
	pipe(res);
}

exports.getDriverStatus = function(req, res) {
	var _res=res;
	var driver = req.params.id;
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
	jmessage = JSON.parse(message);
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
	var driverjob = req.params.id;

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
	var driver = req.params.id;

	getDriverIpPort(driver).then(function(ip) {
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

