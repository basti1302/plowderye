'use strict';

var getCssClasses = require('./conversation_list_css');

module.exports = function ($scope, ConversationService) {

  $scope.getUserConversations = ConversationService.getUserConversations;

  $scope.join = ConversationService.join;

  $scope.getCssClasses = getCssClasses;
};
