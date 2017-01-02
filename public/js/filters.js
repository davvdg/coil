(function() {

'use strict';

/* Filters */

angular.module('myApp.filters', [])
  .filter('interpolate', interpolate)
  .filter('bytes', bytes);

function interpolate(version) {
	return function (text) {
		return String(text).replace(/\%VERSION\%/mg, version);
	};
}

function bytes() {
	return function(bytes, precision) {
		if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
		if (typeof precision === 'undefined') precision = 1;
		var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
			number = Math.floor(Math.log(bytes) / Math.log(1024));
		return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
	}
}

})();