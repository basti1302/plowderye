(function() {
  'use strict';

  angular
    .module('plowderye')
    .controller('MessageLogCtrl',
      function ($scope, MessageService) {
    $scope.getMessages = MessageService.getMessages;
  });

})();
