'use strict';

// Declare app level module which depends on filters, and services

angular.module('myApp')
	.controller("LoginCtrl", LoginCtrl)
	.controller("LogoutCtrl", LogoutCtrl)

LoginCtrl.$inject = ["$location", "AuthService"];

function LoginCtrl($location, AuthService) {
	var vm = this;
	vm.error = false;
	vm.disabled = true;
	vm.errorMessage = "";
	vm.login = login;

	//////////////

    function login() {

      	// initial values
      	vm.error = false;
      	vm.disabled = true;


      	// call login from service
      	AuthService.login(vm.loginForm.username, vm.loginForm.password)
      
        // handle success
		.then(function () {
			$location.path('/');
			vm.disabled = false;
			vm.loginForm = {};
		}, 
		// handle error
		function () {
			vm.error = true;
			vm.errorMessage = "Invalid username and/or password";
			vm.disabled = false;
			vm.loginForm = {};
		});
    };
}

LogoutCtrl.$inject = ["$location", "AuthService"];

function LogoutCtrl($location, AuthService) {
	var vm = this;
	vm.logout = logout;

	//////////////////

    function logout() {

	    // call logout from service
		AuthService.logout()
		.then(function () {
			$location.path('/login');
		});

	};
};