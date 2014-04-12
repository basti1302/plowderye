'use strict';

var angular = require('angular');

angular
  .module('plowderye')
  .controller('SendMessageCtrl',
  function($scope, MessageService, CommandService) {

  $scope.sendMessage = function() {
    var text = $scope.messageText;
    $scope.messageText = null;
    if (!text || text.trim().length === 0) {
      return;
    }

    if (!CommandService.process(text)) {
      MessageService.send(text);
    }
  };

});
