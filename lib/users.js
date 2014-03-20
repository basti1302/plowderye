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

exports.onNewConnection = function(socket, callback) {
  var idFromCookie = readCookie(socket);
  usersState.initUser(idFromCookie, function(user) {
    var id = user.id
    logger.debug('%s initialised user: %j', id, user, {});
    socket.emit('init-user-result', user);
    handleNameChangeAttempts(id, socket);
    handleSettingsChanges(id, socket);
    handleClientDisconnection(id, socket);
    callback(user);
  });
};

function readCookie(socket) {
  var cookieString = socket.handshake.headers['cookie'];
  logger.debug('reading cookie for socket %s: %s', socket.id, cookieString);
  if (!cookieString) {
    return null;
  }
  var cookie = cookieParser.parse(cookieString);
  logger.debug('cookie for socket %s: %j', socket.id, cookie, {});
  if (!cookie) {
    return null;
  }
  return cookie.id;
}

function handleNameChangeAttempts(id, socket) {
  socket.on('set-name', function(name) {
    logger.debug('%s set-name: %j', id, name);
    if (!usersState.isAllowed(name)) {
      logger.debug('%s set-name: name not allowed.', id);
      socket.emit('set-name-result', {
        success: false,
        message: 'Names cannot begin with "Guest".'
      });
    } else {
      if (usersState.isAvailable(name)) {
        var user = usersState.getUserById(id);
        usersState.rename(id, name);
        socket.emit('set-name-result', {
          success: true,
          name: name
        });
        var broadcastObject = {
          id: user.id,
          name: name,
        };
        logger.debug('%s set-name: broadcast: %j', id, broadcastObject, {});
        var broadcastConv = convState.getConversationBySocket(socket);
        messageUtil.broadcast(socket, broadcastConv, 'name-changed', broadcastObject);
      } else {
        logger.debug('%s set-name: name not available.', id);
        socket.emit('set-name-result', {
          success: false,
          message: 'That name is already in use.'
        });
      }
    }
  });
}

exports.sendUsersInConversation = sendUsersInConversation;
function sendUsersInConversation(id, socket) {
  logger.debug('%s sending users in conversation.', id);
  var conversation = convState.getConversationBySocket(socket);
  if (conversation) {
    logger.debug('%s sending users for conversation with id %s', id, conversation.id, {});
    logger.debug('%s users: %j', id, usersState.getUsers(), {});
    // TODO Maybe send only id and nick of users (but not for current user
    // because current user object might be replaced with the object from this
    // collection)
    // TODO It's quite ugly to iterate over *all* users only to find the users
    // that participate in a specific conversation. Store both relations in
    // LevelDB and only use level here, no in-memory vars.
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
    logger.debug('%s no conversation for user.', id);
  }
}

function handleSettingsChanges(id, socket) {
  socket.on('enable-sound', function(enabled) {
    usersState.setSoundEnabled(id, enabled);
  });
  socket.on('enable-notifications', function(enabled) {
    usersState.setNotificationsEnabled(id, enabled);
  });
};

function handleClientDisconnection(id, socket) {
  socket.on('disconnect', function() {
    logger.debug('%s will disconnect', id);
    var conv = convState.getConversationBySocket(socket);
    if (conv) {
      messageUtil.broadcast(socket, convState.getConversationBySocket(socket),
        'user-left', id);
    }
    convState.removeConversationBySocket(socket);
    usersState.onUserDisconnect(id);
  });
};
