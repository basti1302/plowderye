(function() {
  'use strict';

  angular
    .module('plowderye')
    .controller('UserListCtrl',
      function ($scope, socket) {
    socket.on('fetch-users-result', function(users) {
      $scope.users = users;
    });
  });

})();
