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
	}
};

module.exports = config;
