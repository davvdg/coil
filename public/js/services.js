'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
  value('version', '0.1');

angular.module('myApp').factory('AuthService',
  ['$q', '$timeout', '$http',
  function ($q, $timeout, $http) {

    // create user variable
    var user = null;
    var userinfo = null;

    function isLoggedIn() {
		if(user) {
    		return true;
  		} else {
    		return false;
  		}
	}

	function getUserName() {
		return userinfo;
	}

	function getUserStatus() {
		return $http.get('/user/status')
		// handle success
		.then(function (res) {
			console.log(res);
			if(res.data.status){
				user = true;
				userinfo = res.config.data.username;
			} else {
				user = false;
				userinfo = null;
			}
		}, function (data) {
			user = false;
			userinfo = null;
		});
	}

	function login(username, password) {

	// create a new instance of deferred
		var deferred = $q.defer();

		// send a post request to the server
		$http.post('/user/login', {username: username, password: password})
		// handle success
		.then(function (res) {			
			if(res.status === 200 && res.data.status){
				user = true;
				userinfo = res.config.data.username;
				console.log(res.config);
				deferred.resolve();
			} else {
				user = false;
				userinfo = null;
				deferred.reject();
			}
		}, function (res) {
			user = false;
			userinfo = null;
			deferred.reject();
		});

		// return promise object
		return deferred.promise;

	}

	function logout() {

	// create a new instance of deferred
		var deferred = $q.defer();

		// send a get request to the server
		$http.get('/user/logout')
		// handle success
		.then (function (data) {
		  user = false;
		  userinfo = null;
		  deferred.resolve();
		}, function (data) {
		  user = false;
		  userinfo = null;
		  deferred.reject();
		});

		// return promise object
		return deferred.promise;

	}


    // return available functions for use in the controllers
    return ({
      isLoggedIn: isLoggedIn,
      getUserStatus: getUserStatus,
      login: login,
      logout: logout,
      getUserName: getUserName
    });

}]);