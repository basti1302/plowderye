'use strict';

var angular = require('angular');

angular
  .module('plowderye')
  .controller('MessageLogCtrl', function($scope, MessageService) {

  $scope.glued = true;
  $scope.getMessages =
    MessageService.getMessages.bind(MessageService);

});
