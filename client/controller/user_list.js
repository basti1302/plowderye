'use strict';

var userListStyle = require('./user_list_style');

module.exports = function ($scope, socket, UserService) {
  $scope.getAllUsers = UserService.getAllUsers;

  $scope.getCssClasses = function(user) {
    return userListStyle.getCssClasses(user, UserService.getUser());
  };

  $scope.getDisplayName = userListStyle.getDisplayName;
};
