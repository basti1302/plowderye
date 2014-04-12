'use strict';

var angular = require('angular');

angular
  .module('plowderye')
  .controller('HeadlineCtrl', function ($scope, ConversationService) {

  $scope.getCurrentConversationName = function() {
    var conv = ConversationService.getCurrentConversation();
    if (conv && conv.name) {
      return conv.name;
    } else {
      return '?';
    }
  };

});
