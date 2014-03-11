(function() {
  'use strict';

  angular
    .module('plowderye')
    .service('UserService',
      function(socket, $rootScope) {

    var user = 'You';
    var users = [];

    this.getUser = function() {
      return user;
    };

    this.getUsers = function() {
      return users;
    };

    this.changeName = function(name) {
      socket.emit('set-name', name);
    };

    socket.on('set-name-result', function(result) {
      var message;

      if (result.success) {
        user = result.name
        message = 'You are now known as ' + user + '.';
        $.cookie('nick', user);
      } else {
        message = result.message;
      }

      $rootScope.$emit('display-system-message', message);
    });

    socket.on('user-joined', function(user) {
      var userIndex = users.indexOf(user);
      if (userIndex < 0) {
        users.push(user);
      }
    });

    socket.on('user-left', function(user) {
      var userIndex = users.indexOf(user);
      if (userIndex >= 0) {
        users.splice(userIndex, 1);
      }
    });

    socket.on('fetch-users-result', function(_users) {
      users = _users ;
    });
  });

})();
