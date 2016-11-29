/*
 * Serve JSON to our AngularJS client
 */


var http = require("http");
var querystring = require("querystring");
var config = require("../configMgmt.js").config;



exports.name = function (req, res) {
  res.json({
    name: 'Bob'
  });
};

exports.submitjob = function(req,res) {
	var newbody = req.body;
	newbody.action = "CreateSubmissionRequest";
	newbody.clientSparkVersion = "2.0.2";
	if (newbody.sparkProperties["spark.app.name"]===undefined) {
		newbody.sparkProperties["spark.app.name"] = "unamedJob";
	}
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
