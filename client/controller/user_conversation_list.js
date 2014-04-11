'use strict';

var angular = require('angular');

var getCssClasses = require('./conversation_list_style');

angular
  .module('plowderye')
  .controller('UserConvListCtrl', function($scope, ConversationService) {

  $scope.getUserConversations = ConversationService.getUserConversations;

  $scope.switchTo = ConversationService.switchTo;

  $scope.getCssClasses = getCssClasses;
});
