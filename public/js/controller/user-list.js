(function() {
  'use strict';

  angular
    .module('plowderye')
    .controller('UserListCtrl',
      function ($scope, socket, UserService) {

    $scope.getUsers = UserService.getUsers;

  });

})();
