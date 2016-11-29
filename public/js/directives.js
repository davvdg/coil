'use strict';

/* Directives */

angular.module('myApp.directives', []).
  directive('appVersion', function (version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }).
  directive('kvtable', function () {
  return {
    restrict: 'E',
    templateUrl: '/partials/kvtable.html'    
  }
});;
