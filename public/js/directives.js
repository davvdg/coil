'use strict';

/* Directives */

angular.module('myApp.directives', ['myApp.controllers', 'myApp.controllers.cook']).
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
  }).
  directive('mesosuris', function() {
    return {
      scope: {
        rows: '=',
      },
      restrict: 'EA',
      replace: true,
      bindToController: true,
      controller:"MesosUrisCtrl",
      controllerAs:'muctrl',
      templateUrl: 'partials/cook/mesos_uris.tmpl.html',
    }
  }).
    directive('mesosvolumes', function() {
    return {
      scope: {
        rows: '=',
      },
      restrict: 'EA',
      replace: true,
      bindToController: true,
      controller:"MesosVolumesCtrl",
      controllerAs:'muctrl',
      templateUrl: 'partials/cook/mesos_volumes.tmpl.html',
    }
  }).
    directive('mesosports', function() {
    return {
      scope: {
        rows: '=',
      },
      restrict: 'EA',
      replace: true,
      bindToController: true,
      controller:"MesosPortsCtrl",
      controllerAs:'muctrl',
      templateUrl: 'partials/cook/mesos_ports.tmpl.html',
    }
  }).
    directive('itemlist', function() {
    return {
      scope: {
        rows: '=',
      },
      restrict: 'EA',
      replace: true,
      bindToController: true,
      controller:"ItemListCtrl",
      controllerAs:'ctrl',
      templateUrl: 'partials/itemlist.tmpl.html',
    }    
  }).
    directive('jobStatus', function() {
    return {
    }
    
  });
