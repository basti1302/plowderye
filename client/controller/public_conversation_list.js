'use strict';

var getCssClasses = require('./conversation_list_css');

module.exports = function ($scope, ConversationService) {

  $scope.getPublicConversations = ConversationService.getPublicConversations;

  $scope.join = ConversationService.join;

  $scope.getCssClasses = getCssClasses;

};
