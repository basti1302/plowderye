'use strict';

var angular = require('angular');

angular
  .module('plowderye')
 .factory('socket', function(socketFactory) {
  return socketFactory();
});
