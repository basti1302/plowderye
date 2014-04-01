'use strict';

module.exports = function ($scope, ConversationService) {

  var cssClassesActive = [
    'sidebar-item-borders',
    'conv-item',
    'grad-ld',
    'sidebar-item-active'
  ];
  var cssClassesInactive = [
    'sidebar-item-borders',
    'conv-item',
    'grad-ld'
  ];

  $scope.getUserConversations = ConversationService.getUserConversations;
  $scope.getPublicConversations = ConversationService.getPublicConversations;

  $scope.join = ConversationService.join;

  $scope.getCssClasses = function(conversation) {
    if (conversation.active) {
      return cssClassesActive;
    } else {
      return cssClassesInactive;
    }
  };
};
