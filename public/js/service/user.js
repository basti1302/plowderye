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

    function renameInList(previousName, newName) {
      if (previousName != null && newName != null) {
        var userIndex = users.indexOf(previousName);
        if (userIndex >= 0) {
          users.splice(userIndex, 1, newName);
          return true;
        }
      }
      return false;
    }

    socket.on('set-name-result', function(result) {
      var message;

      if (result.success) {
        var previousName = user;
        user = result.name;
        renameInList(previousName, user);
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

    socket.on('name-changed', function(result) {
      var previousName = result.previousName;
      var newName = result.newName;
      if (renameInList(previousName, newName)) {
        $rootScope.$emit('display-system-message',
          previousName + ' is now known as ' + newName + '.');
      }
    });

    socket.on('fetch-users-result', function(_users) {
      users = _users ;
    });
  });

})();
