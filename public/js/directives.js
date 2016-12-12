'use strict';

/* Directives */

angular.module('myApp.directives', ['myApp.controllers']).
  directive('appVersion', function (version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }).
  directive('kvtable', function () {
    return {
    	scope: {
      	confs: '=',
      	setconfs: '&'
      },
      restrict: 'EA',
      templateUrl: 'partials/kvtable.html',
      replace: true,
      controller: "ConfCtrl",
      controllerAs: 'ctrl',
      bindToController: true,
      
    }
  }).
  directive('navelem', function() {
    return {
      templateUrl: 'partials/navtmpl.html',
      controller: "NavCtrl",
      controllerAs: 'ctrl',
    }
  }).
  directive('drivers', function() {
    return {
      templateUrl: 'partials/drivers.tmpl.html',
      controller: "DriversCtrl",
      controllerAs: 'ctrl',
    }
  });
