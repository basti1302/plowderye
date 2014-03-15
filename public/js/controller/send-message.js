(function() {
  'use strict';

  angular
    .module('plowderye')
    .controller('SendMessageCtrl',
      function ($scope, MessageService, CommandService) {

    $scope.sendMessage = function() {
      if (!CommandService.process($scope.messageText)) {
        MessageService.send($scope.messageText);
      }
      $scope.messageText = null;
    }
  });

})();
