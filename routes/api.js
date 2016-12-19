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