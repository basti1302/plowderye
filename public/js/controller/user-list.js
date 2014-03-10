(function() {
  'use strict';

  angular
    .module('plowderye')
    .controller('UserListCtrl',
      function ($scope, socket, UserService) {

    $scope.isCurrentUser = function(user) {
      return user === UserService.getUser();
    };

    socket.on('fetch-users-result', function(users) {
      $scope.users = users ;
    });

  });

})();
