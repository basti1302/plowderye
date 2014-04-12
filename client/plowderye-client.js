'use strict';

require('es5-shim');
require('es5-sham');

window.$ = window.jQuery = require('jquery');
require ('jquery-cookie');

var angular = require('angular');
require('angular-socket-io');
require('angular-animate');
require('angularjs-scroll-glue');

angular.isUndefinedOrNull = function(val) {
  return angular.isUndefined(val) || val === null;
};

angular.module('plowderye', [
  'btford.socket-io',
  'ngAnimate',
  'luegg.directives',
]).constant('version', require('../package.json').version);

require('./factory');
require('./service');
require('./directive');
require('./controller');

require('./init');
