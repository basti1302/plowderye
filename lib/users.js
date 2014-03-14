'use strict';

var cookieParser = require('cookie');
var logger = require('./logger');

var io;

var convState = require('./conversations_state');
var messageUtil = require('./message_util');
var usersState = require('./users_state');

exports.setIo = function(_io) {
  io = _io;
};

exports.onNewConnection = function(socket) {
  var userFromCookie = readCookie(socket);
  var user = initUser(socket, userFromCookie);
  handleNameChangeAttempts(socket);
  handleClientDisconnection(socket);
  sendConfig(socket, user);
  return user;
};

function readCookie(socket) {
  var userFromCookie = {
    conversationId: null,
    soundEnabled: true,
    notificationsEnabled: false,
  };
  var cookieString = socket.handshake.headers['cookie'];
  logger.debug('%s reading cookie: %s', socket.id, cookieString);
  if (!cookieString) {
    return userFromCookie;
  }
  var cookie = cookieParser.parse(cookieString);
  logger.debug('%s cookie: %j', socket.id, cookie, {});
  if (!cookie) {
    return userFromCookie;
  }
  userFromCookie.nick = cookie.nick;
  userFromCookie.conversationId = cookie.conversation || userFromCookie.conversationId;
  if (cookie.sound != null) {
    userFromCookie.soundEnabled = cookie.sound === 'true';
  }
  if (cookie.notifications != null) {
    userFromCookie.notificationsEnabled = cookie.notifications === 'true';
  }
  logger.debug('%s user data from cookie: %j', socket.id, userFromCookie, {});
  return userFromCookie;
}

function initUser(socket, userFromCookie) {
  var user = usersState.initUser(socket, userFromCookie);
  logger.debug('%s initialised user object: %j', socket.id, user);
  socket.emit('init-user-result', user);
  return user;
}

function handleNameChangeAttempts(socket) {
  socket.on('set-name', function(name) {
    logger.debug('%s set-name: %j', socket.id, name);
    if (!usersState.isAllowed(name)) {
      logger.debug('%s set-name: name not allowed.', socket.id);
      socket.emit('set-name-result', {
        success: false,
        message: 'Names cannot begin with "Guest".'
      });
    } else {
      if (usersState.isAvailable(name)) {
        var user = usersState.getUserBySocket(socket);
        usersState.rename(socket, name);
        socket.emit('set-name-result', {
          success: true,
          name: name
        });
        logger.debug('%s set-name: broadcast: %j', socket.id, {
          id: user.id,
          name: name,
        }, {});
        var broadcastConv = convState.getConversationBySocket(socket);
        messageUtil.broadcast(socket, broadcastConv, 'name-changed', {
          id: user.id,
          name: name,
        });
      } else {
        logger.debug('%s set-name: name not available.', socket.id);
        socket.emit('set-name-result', {
          success: false,
          message: 'That name is already in use.'
        });
      }
    }
  });
}

exports.sendUsersInConversation = sendUsersInConversation;
function sendUsersInConversation(socket) {
  logger.debug('%s sending users in conversation.', socket.id);
  var conversation = convState.getConversationBySocket(socket);
  if (conversation) {
    logger.debug('%s sending users for conversation with id %s', socket.id, conversation.id, {});
    logger.debug('%s users: %j', socket.id, usersState.getUsers(), {});
    // TODO Maybe send only id and nick of users (but not for current user
    // because current user object might be replaced with the object from this
    // collection)
    // TODO It's quite ugly to iterate over *all* users only to find the users
    // that participate in a specific conversation.
    var allUsers = usersState.getUsers();
    var usersInConversation = {};
    for (var u in allUsers) {
      var user = allUsers[u];
      if (user.conversationId === conversation.id) {
        usersInConversation[user.id] = user;
      }
    }
    socket.emit('users-in-current-conversation', usersInConversation);
  } else {
    logger.debug('%s no conversation for user.', socket.id);
  }
}

function sendConfig(socket, user) {
  if (!user.soundEnabled) {
    logger.debug('%s sending sound enabled = false', socket.id);
    socket.emit('set-sound-enabled', false);
  }
  if (user.notificationsEnabled) {
    logger.debug('%s sending notifications enabled = true', socket.id);
    socket.emit('set-notifications-enabled', true);
  }
}

function handleClientDisconnection(socket) {
  socket.on('disconnect', function() {
    logger.debug('%s will disconnect', socket.id);
    var conv = convState.getConversationBySocket(socket);
    if (conv) {
      messageUtil.broadcast(socket, convState.getConversationBySocket(socket),
        'user-left', usersState.getUserBySocket(socket).id);
    }
    convState.removeConversationBySocket(socket);
    usersState.onUserDisconnect(socket);
  });
};
