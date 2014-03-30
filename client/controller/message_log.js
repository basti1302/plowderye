'use strict';

module.exports = function ($scope, MessageService) {
  $scope.glued = true;
  $scope.getMessages = MessageService.getMessages;
};
