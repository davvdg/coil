var http = require("http");
var querystring = require("querystring");
var config = require("../configMgmt.js").config;
var request = require('request');
var rp = require('request-promise');
var Promise = require('promise');
var uuid = require('uuid/v4');
var url = require('url');


var browse = function(slaveid, frameworkid, taskid, runid) {
	
}

var browseForTask = function(task) {
	var slaveId = task.slave_id;
	var frameworkId = task.framework_id
	//var runId = getRun();
	var host = getHost(slaveid);
	var path = "/var/lib/mesos/slave/slaves/" + slaveId + "/frameworks/" + frameworkId + "/executors/" + task.id + "/runs/latest";
	var epath =querystring.escape(path);

	var options = {
		url: "http://" + host + ":5051" + "/files/browse?path=" + epath
	}
	return rp(options);
}

var p_getState = function(host) {
	var options = {
		url: "http://" + host + ":" + "5051" + "/state",
		json: true
	}
	var promise = rp(options);
	return promise;
}

/*
frameworks[]
	+ executors[]
		+ tasks[]
			+ statuses[]
				-> state
				-> timestamp
			-> state
		+ completed tasks[]
		-> id =  task.id ?
		-> source = task.id 
		-> directory
*/



var getExecutors = function(stateDataJson) {

	var frameworks = [].concat(stateDataJson.frameworks, stateDataJson.completed_frameworks);
	var executors = [];
	frameworks.forEach(
		function(framework) {
			executors = executors.concat(framework.executors, framework.completed_executors);
		}
	);
	return executors;
}

var getExecutorsForTaskId = function(stateDataJson, taskid) {
	return getExecutors(stateDataJson)
	.filter( 
		function(executor) {
			return executor.id === taskid;
		}
	);
}

var getExecutorForTaskId = function(stateDataJson, taskid) {
	return getExecutors(stateDataJson)
	.find( 
		function(executor) {
			return executor.id === taskid;
		}
	);
}

var getDirectoryForTaskId = function(stateDataJson, taskid) {
	var executor = getExecutorForTaskId(stateDataJson, taskid);
	if (executor === undefined) {
		throw ("executor for task: " + taskid + " not found in executor list");
	}
	return executor.directory;
}
var p_getDirectoryForTaskIdFromMesos = function(host, taskid) {
	return p_getState(host).then(
		function(stateDataJson) {
			return getDirectoryForTaskId(stateDataJson, taskid);
		}
	);
}

exports.getExecutors = getExecutors;
exports.getExecutorsForTaskId = getExecutorsForTaskId;
exports.getExecutorForTaskId = getExecutorForTaskId;
exports.p_getDirectoryForTaskIdFromMesos = p_getDirectoryForTaskIdFromMesos;

var getTasks = function() {
	var options = {
		url: "http://leader.mesos:5050/tasks"
	}
	var promise = rp(options);
	return promise;
}

var getFrameworks = function() {
	var options = {
		url: "http://leader.mesos:5050/frameworks"
	}
	var promise = rp(options).then(function(data) {
		var frameworks = data.frameworks;
		return Promise.resolve(frameworks);
	});
	return promise;
}

var getAgents = function() {
	var options = {
		url: "http://leader.mesos:5050/slaves"
	}
	var promise = rp(options);
	return promise;
}

var getTasksForFrameworkId = function(frameworkId) {
	getTasks.then(function(data) {
		var tasks = data.tasks.filter(function(elem) {
			return elem.framework_id === frameworkId;
		});
		return Promise.resolve(tasks);
	});
}

var getTasksForFramework = function(framework) {
	var frameworkId = framework.id;
	return getTasksForFrameworkId(frameworkId);
}

var getCurrentRunForTaskId = function(taskId) {

}