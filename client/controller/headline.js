'use strict';

module.exports = function ($scope, ConversationService) {
  $scope.getCurrentConversationName = function() {
    var conv = ConversationService.getCurrentConversation();
    if (conv && conv.name) {
      return conv.name;
    } else {
      return '?';
    }
  };
};
