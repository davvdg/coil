var config = {
	auth: {
		method: "local", // or ldapauth
		ldapauth: {
			url: "ldap://localhost:389",
			bindDn: "cn=ldap, dn=com",
			bindCredentials: "passwordforbind"
		}
	}
};

module.exports = config;
