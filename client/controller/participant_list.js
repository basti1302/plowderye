'use strict';

var userListStyle = require('./user_list_style');

module.exports = function ($scope, socket, ConversationService, UserService) {

  $scope.getParticipants = function() {
    return UserService.getParticipants(
      ConversationService.getCurrentConversation());
  };

  $scope.getCssClasses = function(user) {
    return userListStyle.getCssClasses(user, UserService.getUser());
  };

  $scope.getDisplayName = userListStyle.getDisplayName;
};
