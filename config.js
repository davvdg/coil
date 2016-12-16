var config = {
	auth: {
		method: "local", // or ldapauth
		ldapauth: {
			url: "ldaps://ldap.example.com:636",
  			bindDn: "uid=myadminusername,ou=users,o=example.com",
  			bindCredentials: "mypassword",
  			searchBase: "ou=users,o=example.com",
  			searchFilter: "(uid={{username}})"
		}
	},
	spark: {
		url: "spark.yarn",
		port: 80
	},
	cook: {
		url: "cook.framework.host",
		port: 80
	},
	database: {
		method: "local", //or mongo
		mongo: {
			host: "localhost",
			port: 27017,
			dbname: "coil"
		}
	}
};

module.exports = config;
