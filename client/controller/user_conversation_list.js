'use strict';

var angular = require('angular');

var getCssClasses = require('./conversation_list_style');

angular
  .module('plowderye')
  .controller('UserConvListCtrl',
  function($scope, ConversationService, MessageService) {

  $scope.getUserConversations =
    ConversationService.getUserConversations.bind(ConversationService);

  $scope.switchTo =
    ConversationService.switchTo.bind(ConversationService);

  $scope.unreadMessagesCount =
    MessageService.unreadMessageCount.bind(MessageService);

  $scope.hasUnreadMessages =
    MessageService.hasUnreadMessages.bind(MessageService);

  $scope.getCssClasses = getCssClasses;

});
