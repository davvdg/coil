var config = require("../configMgmt.js").config;
var mongoose = require('mongoose');

var promise = require("promise");
mongoose.Promise = promise;

var dbcfg = config.database.mongo;
var uristring = "mongodb://" + dbcfg.host + ":" + dbcfg.port + "/" + dbcfg.dbname;
mongoose.connect(uristring, function (err, res) {
      if (err) {
      console.log ('ERROR connecting to: ' + uristring + '. ' + err);
      } else {
      console.log ('Succeeded connected to: ' + uristring);
      }
    });

var Schema = mongoose.Schema;

var JobSchema = new Schema({
  uuid: String,
  name: String ,
  user: String,
  status: { type: String, default: "Unknown" },
  internalId: String,
  submissionDate: { type: Date, default: Date.now },
  type: String,
  runs: Array,
  submissionCmd: String	  
});

var RunSchema = new Schema({
	task_id: String,
	host: String,
	status: String,
	startDate: Date,
	endDate: Date,
	outputUrl: String
});


JobSchema.statics.getJobsByUser = function(user, cb) {
  return this.find({ name: new RegExp(name, 'i') }, cb);
};

JobSchema.statics.getPendingJobs = function() {
	return this.find({status: "PENDING"});
}

JobSchema.statics.getRunningJobs = function() {
	return this.find({status: "RUNNING"});
}

JobSchema.statics.getFinishedJobs = function() {
	return this.find({status: "DONE"});
}

JobSchema.statics.getJobByInternalIds = function(internalId) {
	return this.find({internalId: internalId});
}

JobSchema.statics.getJobByUuid = function(uuid) {
	return this.findOne({uuid: uuid});
}

JobSchema.statics.getUncompletedJobs = function(uuid) {
	return this.find({status: {'$ne':'DONE' }});
}

var JobModel = mongoose.model("Job", JobSchema);

exports.storeJob = function(job) {
	var Job = new JobModel(job);
	Job.save(function(err) {
		if (err) {
			console.log("save failed");
			console.log(err);
		} else {
			console.log("save successfull");
		}
	});
	return Job;
}

exports.getJobs = function() {
	return JobModel.find();
}

exports.setJobStatus = function(job, status) {
	job.status = status;
	return job.save();
}

exports.getJobByInternalIds = JobModel.getJobByInternalIds.bind(JobModel);

exports.getJobByUuid = JobModel.getJobByUuid.bind(JobModel);

exports.getUncompletedJobs = JobModel.getUncompletedJobs.bind(JobModel);

exports.setRuns = function(Job, runs) {
	Job["runs"] = runs;
	return Job.save();
}

exports.getJobRunsByJobUuid = function(uuid) {
	var p = JobModel.getJobByUuid(uuid);
	p.then(
		function(data) {
			return promise.resolve(data.runs);
		});
	return p;
}