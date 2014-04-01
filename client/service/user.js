'use strict';

module.exports = function(
  socket,
  $rootScope,
  SoundService,
  NotificationService) {

  var user = { nick: 'You', online: true };
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
    user = _user;
    users[user.id] = user;
    $.cookie('id', user.id);
    SoundService.setSoundEnabled(user.soundEnabled);
    NotificationService.setNotificationsEnabled(user.notificationsEnabled);
  });

  socket.on('user-joined', function(_user) {
    log.debug('user-joined');
    log.debug(JSON.stringify(_user, null, 2));
    users[_user.id] = _user;

    /*
    TODO Currently broken: message is displayed in all conversations. Drop
    'has joined' message for now, it's low priority.
    $rootScope.$emit('display-system-message',
      _user.nick + ' has joined this conversation.');
    */

  });

  socket.on('user-left', function(id) {
    log.debug('user-left');
    log.debug(id);
    delete users[id];
  });

  socket.on('user-went-offline', function(id) {
    log.debug('user-went-offline');
    log.debug(id);
    var u = users[id];
    if (u) {
      u.online = false;
    }
  });

  socket.on('name-changed', function(result) {
    log.debug('name-changed');
    log.debug(JSON.stringify(result, null, 2));
    var id = result.id;
    var u = users[id];
    if (u) {
      log.debug('name-changed - user present');
      var previousName = u.nick;
      u.nick = result.name;
      $rootScope.$emit('display-system-message',
        previousName + ' is now known as ' + u.nick + '.');
    }
  });

  socket.on('users-in-current-conversation', function(_users) {
    log.debug('users-in-current-conversation');
    log.debug(JSON.stringify(_users, null, 2));
    users = _users ;

    // was the current user also in the user collection received from the
    // server? If so, replace the current user so that users[user.id] is
    // always the same object as user.
    if (users[user.id]) {
      log.debug('fetch-user-result: replacing current user');
      user = users[user.id];
    }
  });

};
