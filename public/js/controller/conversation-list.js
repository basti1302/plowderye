(function() {
  'use strict';

  angular
    .module('plowderye')
    .controller('ConvListCtrl',
      function ($scope, ConversationService) {
    $scope.getConversations = ConversationService.getConversations;
    $scope.join = ConversationService.join;
 });

})();
