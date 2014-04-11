'use strict';

var angular = require('angular');

var userListStyle = require('./user_list_style');

angular
  .module('plowderye')
  .controller('UserListCtrl', function ($scope, socket, UserService) {
  $scope.getAllUsers = UserService.getAllUsers;

  $scope.getCssClasses = function(user) {
    return userListStyle.getCssClasses(user, UserService.getUser());
  };

  $scope.getDisplayName = userListStyle.getDisplayName;
});
