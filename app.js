
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
  http = require('http'),
  path = require('path');

var cookieParser = require('cookie-parser');
var passport = require('passport');



var configPath = process.env.CONF_FILE_PATH || "./config.js";

var parseEnvVars = function() {
	for (i in process.env) {
		if (i.startsWith("COIL__")) {
			var value = process.env[i];
			var newEnv = i
			.replace("COIL__","")
			.replace(/__/g,".")
			.toLowerCase()
			.replace(/(\_[a-z])/g, function($1){
				return $1.toUpperCase().replace('_','');
			});
			var configPath = newEnv.split(".");
			var configkey = config;
			console.log(configkey);
			console.log(configPath);
			var override = true;
			for (var idx=0; idx < configPath.length; idx++) {
				var elem = configPath[idx];
				console.log(elem);
				if (elem in configkey) {
					configkey = config[elem];
				} else {
					console.log("key " + elem + "not in " + configkey + "... skipping " + configPath);
					override = false;
					break;
				}
			}
			if (override) {
				console.log("setting config key" + configPath + "=" + value); 
				configkey = value;
			} 	
		}
	}
}


var config = require(configPath);
parseEnvVars();

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
    /*
    db.users.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
    */
  }));
}

if (config.auth.method === "ldapauth") {
	passport.use(new LdapStrategy({
		server: config.auth.ldapauth
	}
	));
}
passport.serializeUser(function(user, cb) {
  cb(null, user.username);
});

passport.deserializeUser(function(id, cb) {
  
  cb(null, {username:id});
  
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

// JSON API
app.get('/api/name', api.name);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

app.post('/api/submit', auth, api.submitjob);

/**
 * Start Server
 */

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
