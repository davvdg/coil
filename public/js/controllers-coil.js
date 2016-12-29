angular.module('myApp.controllers.coil', [])
.controller("CoilRunLogBrowserCtrl", function($scope, $http, $routeParams) {
	var vm = this;
	vm.jobid = $routeParams.jobid;
	vm.runid = $routeParams.runid;
	vm.items = [];

	load();

    function load() {
      $http.get('/api/coiljobs/'+vm.jobid+'/runs/'+ vm.runid+'/browse')
      .then(
        function(res) {
          vm.items = res.data;
        },
        function(err) {
          console.log(err);
        }
      );
    }
});