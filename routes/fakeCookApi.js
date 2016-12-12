var http = require("http");
var querystring = require("querystring");
var config = require("../configMgmt.js").config;
var request = require('request');
var rp = require('request-promise');
var uuid = require('uuid/v4');
var url = require('url');

var oldjobuuid = uuid();
var frameworkUuid = uuid();
var slaveUuid = uuid();
var executor_id = uuid();

var jobStatus = ["waiting", "running", "completed"];
var instanceStatus = ["unknown", "running", "success", "failed"];

var jobStatus = {
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
	res.json({});
}

exports.getJobStatus = function(req, res) {
	res.json({});
}

exports.deleteKillCookJobs = function(res, res) {
	res.json({});
}

exports.postRetryCookJob = function(res, res) {
	res.json({});
}