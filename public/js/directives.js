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
      	confs: '='
      },
      restrict: 'EA',
      templateUrl: 'partials/kvtable.html',
      replace: true,
      controller: "ConfCtrl",
      controllerAs: 'ctrl',
      bindToController: true
    }
  }).
  directive('navelem', function() {
    return {
      templateUrl: 'partials/navtmpl.html',
      controller: "NavCtrl",
      controllerAs: 'ctrl',
    }
  });
