angular.module('myApp.controllers.coil', [])
.controller("CoilRunLogBrowserCtrl", function($scope, $http, $routeParams) {
	var self = this;
	self.jobid = $routeParams.jobid;
	self.runid = $routeParams.runid;
	self.items = []
    self.load = function() {
      $http.get('/api/coiljobs/'+self.jobid+'/runs/'+ self.runid+'/browse')
      .then(
        function(res) {
          self.items = res.data;
        },
        function(err) {
          console.log(err);
        }
      );
    }
	self.load();
});