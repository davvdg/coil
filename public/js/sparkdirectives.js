angular.module('myApp.sparkdirectives', ['myApp.sparkcontrollers'])
  .directive('spark-job-row', function () {
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
      bindToController: true
    }
  })
  ;