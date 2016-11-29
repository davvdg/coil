var configPath = process.env.CONF_FILE_PATH || "./config.js";

var parseEnvVars = function(config) {
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
                        var obj = config;
      var key = undefined;
                        var override = true;
                        for (var idx=0; idx < configPath.length; idx++) {
                                var key = configPath[idx];
                                if (key in obj) {
          if (idx === configPath.length -1) {
            obj = obj;
            key = key;
          } else {
            obj = obj[key];
          }
                                } else {
                                        console.log("key " + elem + " not in " + obj + "... skipping " + configPath);
                                        override = false;
                                        break;
                                }
                        }

                        if (override) {
                                console.log("ENV setting config key " + newEnv + "=" + value);
                                obj[key] = value;
                        }
                }
        }
  return config;
}

var config = require(configPath);
config = parseEnvVars(config);

console.log(config);
exports.config = config;
