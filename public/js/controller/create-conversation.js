(function() {
  'use strict';

  angular
    .module('plowderye')
    .controller('CreateConversationCtrl',
      function ($scope, $timeout, ConversationService) {

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

  angular
    .module('plowderye')
    .directive('focusOn',
      function($timeout) {
    return {
      link: function(scope, element, attrs) {
        scope.$watch(attrs.focusOn, function(value) {
          if(value === true) {
            $timeout(function() {
              element[0].focus();
              scope[attrs.focusOn] = false;
            });
          }
        });
      }
    };
  });
})();
