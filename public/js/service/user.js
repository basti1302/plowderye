(function() {
  'use strict';

  angular
    .module('plowderye')
    .service('UserService',
      function(socket, $rootScope, SoundService, NotificationService) {

    var cssClassesCurrent = ['sidebar-item-borders', 'user-item', 'user-item-skin', 'sidebar-item-active'];
    var cssClasses        = ['sidebar-item-borders', 'user-item', 'user-item-skin'];

    function getCssClasses() {
      if (this.id ===  user.id) {
        return cssClassesCurrent;
      } else {
        return cssClasses;
      }
    };

    var user = bindCss({
      nick: 'You',
    });
    var users = {};

    this.getUser = function() {
      log.trace('getUser');
      log.trace(JSON.stringify(user, null, 2));
      return user;
    };

    this.getUsers = function() {
      log.trace('getUsers');
      log.trace(JSON.stringify(users, null, 2));
      return users;
    };

    this.changeName = function(name) {
      socket.emit('set-name', name);
    };

    socket.on('set-name-result', function(result) {
      var message;
      log.debug('set-name-result');
      log.debug(JSON.stringify(result, null, 2));
      if (result.success) {
        log.debug('set-name-result: success');
        user.nick = result.name;
        message = 'You are now known as ' + user.nick + '.';
      } else {
        log.debug('set-name-result: failure');
        message = result.message;
      }

      $rootScope.$emit('display-system-message', message);
    });

    socket.on('init-user-result', function(_user) {
      var message;
      log.debug('init-user-result');
      log.debug(JSON.stringify(_user, null, 2));
      user = bindCss(_user);
      users[user.id] = user;
      $.cookie('id', user.id);
      SoundService.setSoundEnabled(user.soundEnabled);
      NotificationService.setNotificationsEnabled(user.notificationsEnabled);
    });

    socket.on('user-joined', function(_user) {
      // TODO Is it okay to always overwrite the client user object with the
      // object from the server?
      log.debug('user-joined');
      log.debug(JSON.stringify(_user, null, 2));
      bindCss(_user);
      users[_user.id] = _user;

      // was the user in the user-joined message from the server the current
      // user? If so, replace the current user object so that users[user.id] is
      // always the same object as user. This should not happen as user-joined
      // is broadcasted to all *other* users in the conversation, but not to the
      // user joining the conversation.
      if (_user.id === user.id) {
        log.debug('!!!! user-joined: replacing current user');
        user = _user;
      }
    });

    socket.on('user-left', function(id) {
      log.debug('user-left');
      log.debug(id);
      delete users[id];
      log.debug(JSON.stringify(users, null, 2));
    });

    socket.on('name-changed', function(result) {
      log.debug('name-changed');
      log.debug(JSON.stringify(result, null, 2));
      var id = result.id;
      var user = users[id];
      if (user) {
        log.debug('name-changed - user present');
        var previousName = user.nick;
        user.nick = result.name;
        $rootScope.$emit('display-system-message',
          previousName + ' is now known as ' + user.nick + '.');
      }
    });

    socket.on('users-in-current-conversation', function(_users) {
      log.debug('users-in-current-conversation');
      log.debug(JSON.stringify(_users, null, 2));
      users = _users ;
      for (var u in users) {
        bindCss(users[u]);
      }

      // was the current user also in the user collection received from the
      // server? If so, replace the current user so that users[user.id] is
      // always the same object as user.
      if (users[user.id]) {
        log.debug('!! fetch-user-result: replacing current user');
        user = users[user.id];
      }
    });

    function bindCss(_user) {
      _user.getCssClasses = getCssClasses.bind(_user);
      return _user;
    }

  });

})();
