  'use strict';

angular.module('myApp.controllers.spark', [])
  .controller('SparkSubmitJobCtrl', function ($scope, $http, $location, PersistJobsService) {
    var self = this;
    self.mainClass = "";
    self.arguments = "";
    self.ressource = "";
    self.confs = {};
    self.envs = {};
    self.errorMessage = null;
    // write Ctrl here
    /**
      Reset the controller
    */
    self.clearAll = function() {
      console.log("clear");
      self.mainClass = "";
      self.arguments = "";
      self.ressource = "";
      self.confs = {};
      self.envs = {};
      self.errorMessage = null
      PersistJobsService.resetData("spark");
    }

    var prepareJson= function() {
      var data = {
        "appResource": self.ressource,
        "mainClass": self.mainClass,
        "appArgs": self.arguments.split(" "),
        "sparkProperties" : self.confs,
        "environmentVariables": self.envs
      }
      return data;    
    }

    self.submitJob = function() {
      var data = prepareJson();

      $http.post('/api/submit/spark', data)
      .then(
        // on success
        function(res) {

          console.log(res);
          PersistJobsService.resetData("spark");
          var driverid = res.data.uuid;
          $location.path("/coiljobs/" + driverid);
        }, 
        // on error
        function(res) {
          console.log(res);
          self.errorMessage = res.data;
        });
    }

    self.downloadJson = function() {
      var data = prepareJson();
    
      var filename = 'job.json';

      if (typeof data === 'object') {
        data = JSON.stringify(data, undefined, 2);
      }

      var blob = new Blob([data], {type: 'text/json'});

  // FOR IE:

      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(blob, filename);
      }
      else{
          var e = document.createEvent('MouseEvents'),
              a = document.createElement('a');

          a.download = filename;
          a.href = window.URL.createObjectURL(blob);
          a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
          e.initEvent('click', true, false, window,
              0, 0, 0, 0, 0, false, false, false, false, 0, null);
          a.dispatchEvent(e);
      }
    }

    var setFromJson = function(jData) {
      self.ressource = jData.appResource;
      self.arguments = jData.appArgs.join(" ");
      self.mainClass = jData.mainClass;
      self.confs = jData.sparkProperties;
      self.envs =jData.environmentVariables;
      //$scope.$apply();
    }

    self.loadJson = function() {
      var x = document.createElement("INPUT");
      x.setAttribute("type", "file");
      var e = document.createEvent('MouseEvents');
      e.initEvent('click', true, false, window,
              0, 0, 0, 0, 0, false, false, false, false, 0, null);
      x.dispatchEvent(e);      
      x.onchange = function() {
        var f = x.files[0];
      //var f = document.getElementById('file').files[0];
        console.log(f);
        console.log(self);
        var r = new FileReader();
        r.onloadend = function(e){
          var data = e.target.result;
          
          var jData = JSON.parse(data);
          PersistJobsService.setData('spark', jData);
          setFromJson(jData);
          $scope.$apply();    
          //send your binary data via $http or $resource or do anything else with it
        }
        r.readAsText(f);        
      }
    }

    $scope.$on('$locationChangeStart', function(event, next, current) {
      var jData = prepareJson();
      PersistJobsService.setData('spark', jData);
    });
    
    var pData = PersistJobsService.getData();
    console.log(pData);
    if ( pData.spark) {
      setFromJson(pData.spark)
    }
  });