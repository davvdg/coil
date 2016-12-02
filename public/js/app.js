'use strict';

// Declare app level module which depends on filters, and services

angular.module('myApp', [
  'ngMaterial',
  'ngRoute',
  'myApp.controllers',
  'myApp.filters',
  'myApp.services',
  'myApp.directives'
]).
config(function ($routeProvider, $locationProvider) {
  $routeProvider.
    when('/', {
      templateUrl: 'partials/home.html',
    }).
    when('/login', {
      templateUrl: 'partials/login.html',
      controller: 'LoginCtrl'
    }).
    when('/logout', {
      controller: 'LogoutCtrl'
    }).
    when('/createjob', {
      templateUrl: 'partials/createjob.html',
      controller: 'JobCtrl'
    }).
    when('/view2', {
      templateUrl: 'partials/partial2',
      controller: 'MyCtrl2'
    }).
    otherwise({
      redirectTo: '/'
    });

  $locationProvider.html5Mode(true);
}).run(function ($rootScope, $location, $route, AuthService) {
  $rootScope.$on('$routeChangeStart',
    function (event, next, current) {
    AuthService.getUserStatus()
    .then( function() {
      if (AuthService.isLoggedIn() === false) {
        $location.path('/login');
      };
    }, function(res) {
      console.log(res);
    });
  });
});