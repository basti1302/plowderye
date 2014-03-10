(function() {
  'use strict';

  angular
    .module('plowderye')
    .service('UserService',
      function(socket, $rootScope, $interval) {

    var user = 'You';

    this.getUser = function() {
      return user;
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

    // TODO This is nonsense. server knows all users and conversations and can
    // emit user lists on its own, without being polled.
    $interval(function() {
      socket.emit('fetch-users');
    }, 10000);
  });

})();
