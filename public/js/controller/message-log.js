(function() {
  'use strict';

  angular
    .module('plowderye')
    .controller('MessageLogCtrl',
      function ($scope, MessageService) {
    $scope.glued = true;
    $scope.getMessages = MessageService.getMessages;
  });

})();
