'use strict';

var logger = require('loglevel');

var _      = {};
_.omit     = require('lodash.omit');
_.values   = require('lodash.values');

module.exports = function(
  socket,
  $rootScope,
  ConversationService,
  SoundService,
  NotificationService) {

  var user = { nick: 'You', online: true };
  var allUsers = {};
  var usersPerConversation = {};

  this.getUser = function() {
    logger.trace('getUser');
    logger.trace(JSON.stringify(user, null, 2));
    return user;
  };

  this.getParticipants = function(conversation) {
    logger.trace('getParticipants');
    if (!conversation) {
      return [];
    }
    if (!usersPerConversation[conversation.id]) {
      return [];
    }
    return sort(_.values(usersPerConversation[conversation.id]));
  };

  this.getAllUsers = function() {
    logger.trace('getAllUsers');
    logger.trace(JSON.stringify(allUsers, null, 2));
    return sort(_.values(allUsers));
  };

  function sort(u) {
    return u.sort(function (a, b) {
      if (a.online && !b.online) {
        return -1;
      } else if (!a.online && b.online) {
        return 1;
      } else if (a.nick > b.nick) {
        return 1;
      } else if (a.nick < b.nick) {
        return -1;
      } else {
        return 0;
      }
    });
  }

  this.changeName = function(name) {
    socket.emit('set-name', name);
  };

  socket.on('set-name-result', function(result) {
    var text;
    logger.debug('set-name-result');
    logger.debug(JSON.stringify(result, null, 2));
    if (result.success) {
      logger.debug('set-name-result: success');
      user.nick = result.name;
      text = 'You are now known as ' + user.nick + '.';
    } else {
      logger.debug('set-name-result: failure');
      text = result.message;
    }

    $rootScope.$emit('display-system-message', {
      text: text,
      conversation: '*',
    });
  });

  socket.on('init-user-result', function(_user) {
    var message;
    logger.debug('init-user-result');
    logger.debug(JSON.stringify(_user, null, 2));
    user = _user;
    allUsers[user.id] = user;
    replaceUserInAllCollections(user);
    $.cookie('id', user.id);
    SoundService.setSoundEnabled(user.soundEnabled);
    NotificationService.setNotificationsEnabled(user.notificationsEnabled);
  });

  socket.on('user-joined', function(userJoinedData) {
    logger.debug('user-joined');
    logger.debug(JSON.stringify(userJoinedData, null, 2));
    var _user = userJoinedData.user;
    var conversationId = userJoinedData.conversationId;
    usersPerConversation[conversationId][_user.id] = _user;
    replaceUserInAllCollections(_user);
    $rootScope.$emit('display-system-message', {
      text: _user.nick + ' has joined this conversation.',
      conversation: conversationId,
    });
  });

  socket.on('user-left', function(userLeftData) {
    logger.debug('user-left');
    logger.debug(JSON.stringify(userLeftData, null, 2));
    var _user = userLeftData.user;
    var conversationId = userLeftData.conversationId;
    delete
      usersPerConversation[conversationId][_user.userId];
    $rootScope.$emit('display-system-message', {
      text: _user.nick + ' has left this conversation.',
      conversation: conversationId,
    });
  });

  socket.on('user-went-offline', function(id) {
    logger.debug('user-went-offline');
    logger.debug(id);
    var u = allUsers[id];
    if (u) {
      u.online = false;
    }
  });

  socket.on('user-coming-online', function(id) {
    logger.debug('user-coming-online');
    logger.debug(id);
    var u = allUsers[id];
    if (u) {
      u.online = true;
    }
  });

  socket.on('user-changed', function(_user) {
    logger.debug('user-changed');
    logger.debug(JSON.stringify(_user, null, 2));
    replaceUserInAllCollections(_user);
    /*
    var id = _user.id;
    var userNow = allUsers[id];
    if (userNow) {
      logger.debug('user-changed - user is present');
      var previousName = u.nick;
      u.nick = result.name;
      $rootScope.$emit('display-system-message', {
        text: userNow.nick + ' is now known as ' + _user.nick + '.',
        conversation: '*',
      });
    }
    */
  });

  socket.on('user-list', function(users) {
    logger.debug('user-list');
    logger.debug(JSON.stringify(users, null, 2));
    allUsers = users;
    replaceAllUsersInAllCollections(allUsers);
  });

  socket.on('participant-list', function(participantData) {
    logger.debug('participant-list');
    logger.debug(JSON.stringify(participantData, null, 2));
    usersPerConversation[participantData.conversationId] =
      participantData.participants;
    replaceAllUsersInAllCollections(
      usersPerConversation[participantData.conversationId]);
  });

  function replaceAllUsersInAllCollections(usersFromServer) {
    // replace all user objects in each collection of users we track
    for (var u in usersFromServer) {
      var userFromServer = usersFromServer[u];
      replaceUserInAllCollections(userFromServer);
    }
    // replace the current user object with the fresh object from the server
    if (usersFromServer[user.id]) {
      user = usersFromServer[user.id];
    }
  }

  function replaceUserInAllCollections(userFromServer) {
    replaceUserInCollection(userFromServer, allUsers);
    forUsersInEachConversation(function(usersInConvesation) {
      replaceUserInCollection(userFromServer, usersInConvesation);
    });
  }

  function replaceUserInCollection(userFromServer, users) {
    if (users[userFromServer.id]) {
      users[userFromServer.id] = userFromServer;
    }
  }

  function forUsersInEachConversation(fn) {
    for (var c in usersPerConversation) {
      fn(usersPerConversation[c]);
    }
  }
};
