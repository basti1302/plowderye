'use strict';

var angular = require('angular');

var getCssClasses = require('./conversation_list_style');

angular
  .module('plowderye')
  .controller('PublicConvListCtrl', function($scope, ConversationService) {

  $scope.getPublicConversations =
    ConversationService.getPublicConversations.bind(ConversationService);

  $scope.join =
    ConversationService.join.bind(ConversationService);

  $scope.getCssClasses = getCssClasses;

});
