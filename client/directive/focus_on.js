'use strict';

/*
 * Set focus to the element this directive is declared upon when the given
 * expression evaluates to true.
 */

var angular = require('angular');

angular
  .module('plowderye')
  .directive('focusOn', function($timeout) {
  return {
    link: function(scope, element, attrs) {
      scope.$watch(attrs.focusOn, function(value) {
        if(value === true) {
          $timeout(function() {
            element[0].focus();
            scope[attrs.focusOn] = false;
          });
        }
      });
    }
  };
});
