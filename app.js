
/**
 * Module dependencies
 */

var express = require('express'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  errorHandler = require('express-error-handler'),
  morgan = require('morgan'),
  routes = require('./routes'),
  api = require('./routes/api'),
  fakeapi = require('./routes/fakeapi'),
  http = require('http'),
  path = require('path');

var cookieParser = require('cookie-parser');
var passport = require('passport');


var config = require("./configMgmt.js").config;

console.log(config);

var LdapStrategy = require('passport-ldapauth');
var LocalStrategy = require('passport-local').Strategy;




if (config.auth.method === "local") {
  passport.use(new LocalStrategy(
    function(username, password, cb) {
      console.log(username,password);
      if (username==="xxxxx" && password==="xxxxx") {
        var user = {username:"xxxxx","password":"xxxxx"};
        return cb(null, user);
      }
      return cb(null, false);
    })
  );
}

if (config.auth.method === "ldapauth") {
	passport.use(new LdapStrategy({
		server: config.auth.ldapauth
	}
	));
}

passport.serializeUser(function(user, cb) {
  //console.log(user);
  cb(null, user);
});

passport.deserializeUser(function(user, cb) {
  
  cb(null, user);
  
});





var app = module.exports = express();


/**
 * Configuration
 */

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(morgan('dev'));
app.use(bodyParser());
app.use(cookieParser());
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

var env = process.env.NODE_ENV || 'development';

// development only
if (env === 'development') {
  app.use(errorHandler());
}

// production only
if (env === 'production') {
  // TODO
}

app.use(passport.initialize());
app.use(passport.session());

var auth = function(req, res, next){ 
  if (!req.isAuthenticated()) res.send(401); 
  else next();
};

/**
 * Routes
 */

// serve index and view partials
app.get('/', routes.index);

app.get('/user/loggedin', function(req, res) {
  res.send(req.isAuthenticated() ? req.user : '0'); 
});

app.post('/user/login', function(req, res, next) {
  passport.authenticate(config.auth.method, function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
	console.log("failed to log user");
	console.log(err);
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }
      res.status(200).json({
        status: 'Login successful!'
      });
    });
  })(req, res, next);
});
  
app.get('/user/logout', function(req, res) {
  req.logout();
  res.status(200).json({
    status: 'Bye!'
  });
});

app.get('/user/status', function(req, res) {
  if (!req.isAuthenticated()) {
    return res.status(200).json({
      status: false
    });
  }
  res.status(200).json({
    status: true
  });
});

//app.get('/partials/:name', routes.partials);
app.get("/drivergui/:driverid", auth, api.proxyDriver);
app.get("/drivergui/:driverid/jobs", auth, api.proxyDriver);
app.get("/drivergui/:driverid/stages", auth, api.proxyDriver);
app.get("/drivergui/:driverid/storage", auth, api.proxyDriver);
app.get("/drivergui/:driverid/environment", auth, api.proxyDriver);
app.get("/drivergui/:driverid/executors", auth, api.proxyDriver);
app.get("/drivergui/:driverid/threadDump", auth, api.proxyDriver);

app.get("/drivergui/:driverid/jobs/job", auth, api.proxyDriver);
app.get("/drivergui/:driverid/stages/stage", auth, api.proxyDriver);
app.get("/drivergui/:driverid/stages/kill", auth, api.proxyDriver);
app.get("/drivergui/:driverid/storage/rdd", auth, api.proxyDriver);
// JSON API
app.get('/api/name', api.name);

// redirect all others to the index (HTML5 history)


app.post('/api/submit', auth, api.submitjob);

app.post('/api/driver/:driverid/kill',  auth, api.killJob);
app.get("/api/driver/:driverid/status", auth, api.getDriverStatus);
app.get('/api/driver/list',       auth, api.getDriverList);


//app.get('/api/driver/:driverid/applications',                                                        auth, fakeapi.fakeApplications);
//app.get('/api/driver/:driverid/applications/:appid/jobs',                                           auth, fakeapi.fakeJobs);
//app.get('/api/driver/:driverid/applications/:appid/jobs/:jobid',                                           auth, fakeapi.fakeJob);
//app.get('/api/driver/:driverid/applications/:appid/executors',                                      auth, fakeapi.fakeExecutors);

app.get('/api/driver/:driverid/applications',                                                        auth, api.proxyDriverApi);
app.get('/api/driver/:driverid/applications/:appid/jobs',                                           auth, api.proxyDriverApi);
app.get('/api/driver/:driverid/applications/:appid/jobs/:jobid',                                           auth, api.proxyDriverApi);
app.get('/api/driver/:driverid/applications/:appid/stages',                                         auth, api.proxyDriverApi);
app.get('/api/driver/:driverid/applications/:appid/stages/:stageid',                               auth, api.proxyDriverApi);
app.get('/api/driver/:driverid/applications/:appid/stages/:stageid/:stageattemptid',             auth, api.proxyDriverApi);
app.get('/api/driver/:driverid/applications/:appid/stages/:stageid/:stageattemptid/taskSummary', auth, api.proxyDriverApi);
app.get('/api/driver/:driverid/applications/:appid/stages/:stageid/:stageattemptid/taskList',    auth, api.proxyDriverApi);
app.get('/api/driver/:driverid/applications/:appid/executors',                                      auth, api.proxyDriverApi);
app.get('/api/driver/:driverid/applications/:appid/storage/rdd',                                    auth, api.proxyDriverApi);
app.get('/api/driver/:driverid/applications/:appid/storage/rdd/rddid',                             auth, api.proxyDriverApi);
app.get('/api/driver/:driverid/applications/:appid/logs',                                           auth, api.proxyDriverApi);
app.get('/api/driver/:driverid/applications/:appid/:attemptid/logs',                               auth, api.proxyDriverApi);




app.get('*', routes.index);





/**
 * Start Server
 */

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
  api.parseDriverPage();
});
