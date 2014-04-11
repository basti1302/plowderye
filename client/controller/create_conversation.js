'use strict';

var angular = require('angular');

angular
  .module('plowderye')
  .controller('CreateConversationCtrl', function(
  $scope,
  $timeout,
  ConversationService) {

  hide();

  $scope.toggle = function() {
    $scope.formVisible = !$scope.formVisible;
    $scope.focusInput = $scope.formVisible;
    $scope.inputHasFocus = $scope.focusInput;
    $('#create-conversation-div').removeClass('initially-invisible');
  };

  $scope.onLeave = function() {
    $timeout(function() {
      if (!$scope.buttonHasFocus && !$scope.inputHasFocus) {
        hide();
      }
    }, 100);
  };

  $scope.createConversation = function() {
    if ($scope.conversationName) {
      ConversationService.create($scope.conversationName);
      $scope.conversationName = null;
    }
    $timeout(hide, 100);
  };

  function hide() {
    $scope.formVisible = false;
    $scope.focusInput = false;
    $scope.inputHasFocus = false;
    $scope.buttonHasFocus = false;
  }
});
