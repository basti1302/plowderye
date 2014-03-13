(function() {
  'use strict';

  angular
    .module('plowderye')
    .controller('UserListCtrl',
      function ($scope, socket, UserService) {

    $scope.isCurrentUser = function(user) {
      return user.id === UserService.getUser().id;
    };

    $scope.getUsers = UserService.getUsers;

  });

})();
