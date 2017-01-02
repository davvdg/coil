(function() {


'use strict';

angular
	.module('myApp.coiljobs')
	.config(routeConfig);

routeConfig.$inject = ['$routeProvider', '$locationProvider'];

function routeConfig($routeProvider, $locationProvider) {
	$routeProvider.
	when('/coiljobs', {
      templateUrl: 'partials/coiljobs.tmpl.html',
      controller: 'CoilJobsCtrl',
      controllerAs: 'ctrl'
    }).
    when('/coiljobs/:jobid', {
      templateUrl: 'partials/coiljob.tmpl.html',
      controller: 'CoilJobCtrl',
      controllerAs: 'ctrl'
    }).
    when('/coiljobs/:jobid/runs/:runid/files', {
      templateUrl: 'partials/coiljob_run_browse.tmpl.html',
      controller: 'CoilRunLogBrowserCtrl',
      controllerAs: 'ctrl'
    });

}

})();