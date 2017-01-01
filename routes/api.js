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

//var browsejson = require("../samplejson/browsepp.json");


exports.getCoilJobs = function(req, res) {
	db.getJobs()
	.then(
		function(data, data1) {
			console.log(data);
			console.log(data1);
			res.json(data);
		}
	)
	.catch(
		function(err) {
			console.log(err);
		}
	);
}

exports.getCoilJob = function(req, res) {
	var uuid = req.params.jobid;
	db.getJobByUuid(uuid).then( 
		function(data) {
			res.json(data);
	}).catch(function(err) {
		console.log("no job for id:" + uuid);
		res.json({});
	});
}

exports.getCoilJobRuns = function(req, req) {
	var uuid = req.params.jobid;
	db.getJobRunsByJobUuid(uuid).then(
		function(data) {
			res.json(data);
		}
	.catch(
		function(err) {
			res.json([]);
		})
	);
}
exports.killCoilJob = function(req, res) {
	var uuid = req.params.jobid;
	db.killCoilJobByUuid(uuid).then( 
		function(data) {
			res.json(data);
	}).catch(function(err) {
		console.log("error killing Coil job :" + uuid);
		res.status(424).json(err);
	});	
}

exports.browseCoilJobRun = function(req, res) {
	var jobuuid = req.params.jobid;
	var runid = req.params.runid;
	var path = req.params.path;

	if (path === undefined) {
		path = "";
	}
	if (path === "/") {
		path = "";
	}

	db.getJobRunsByJobUuid(jobuuid)
	.then(
		function(runs) {
			console.log(runs);
			var run = runs.find(function(elem) {
				return elem.task_id === runid;
			});
			if (run) {
				var outputUrl = run.outputUrl;
				var options = {
					url:'http://'+ run.host + ':' + config.mesos.slaves.port + '/files/browse?path=' + outputUrl + path,
					json: true
				}
				//var json = browsejson;
				ret = request(options, function(error, response, data) {
					if (!error && response.statusCode === 200) {
						var newData = data.map(
							function(item) {
								item.path = item.path.replace(outputUrl, "");
							}
						);
						res.json(data);
					} else {
						res.status(response.statusCode).json({error: error});
					}
				});
			} else {
				// todo: error code: run not found
				res.status(424).json({error: "run not found"});
			}
		})
	.catch(
		function(err) {
			console.log(err);
			res.status(424).json({error: err});
		});
}

exports.downloadCoilJobRunFile = function(req, res) {
	var jobuuid = req.params.jobid;
	var runid = req.params.runid;
	var path = req.params.path;

	if (path === undefined) {
		path = "";
	}
	if (path === "/") {
		path = "";
	}
	db.getJobRunsByJobUuid(jobuuid)
	.then(
		function(runs) {
			console.log(runs);
			var run = runs.find(function(elem) {
				return elem.task_id === runid;
			});
			if (run) {
				var outputUrl = run.outputUrl;
				var options = {
					url:'http://'+ run.host + ':' + config.mesos.slaves.port + '/files/download?path=' + outputUrl + path,
				}
				//var json = browsejson;
				ret = request(options);
				ret.pipe(res);
			} else {
				// todo: error code: run not found
				res.status(424).json({error: "run not found"});
			}
		})
	.catch(
		function(err) {
			console.log(err);
			res.status(424).json({error: err});
		});
	

}