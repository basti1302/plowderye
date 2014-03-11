(function() {
  'use strict';

  angular
    .module('plowderye')
    .controller('UserListCtrl',
      function ($scope, socket, UserService) {

    $scope.isCurrentUser = function(user) {
      return user === UserService.getUser();
    };

    $scope.getUsers = UserService.getUsers;

  });

})();
