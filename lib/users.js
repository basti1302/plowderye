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
  var user = readCookie(socket);
  assignInitialNick(socket, user.nick);
  handleNameChangeAttempts(socket);
  handleFetchUsers(socket);
  handleClientDisconnection(socket);
  sendConfig(socket, user);
  return user;
};

function readCookie(socket) {
  var user = {
    conversationId: null,
    soundEnabled: true,
    notificationsEnabled: false,
  };
  var cookieString = socket.handshake.headers['cookie'];
  logger.debug('%s reading cookie: %s', socket.id, cookieString);
  if (!cookieString) {
    return user;
  }
  var cookie = cookieParser.parse(cookieString);
  logger.debug('%s cookie: %j', socket.id, cookie, {});
  if (!cookie) {
    return user;
  }
  user.nick = cookie.nick;
  user.conversationId = cookie.conversation || user.conversationId;
  if (cookie.sound != null) {
    user.soundEnabled = cookie.sound === 'true';
  }
  if (cookie.notifications != null) {
    user.notificationsEnabled = cookie.notifications === 'true';
  }
  logger.debug('%s user data from cookie: %j', socket.id, user, {});
  return user;
}

function assignInitialNick(socket, nickFromCookie) {
  var nick = usersState.getInitialNick(socket, nickFromCookie);
  logger.debug('%s assigning initial nick: %s', socket.id, nick);
  socket.emit('set-name-result', {
    success: true,
    name: nick,
  });
}

function handleNameChangeAttempts(socket) {
  socket.on('set-name', function(name) {
    if (!usersState.isAllowed(name)) {
      socket.emit('set-name-result', {
        success: false,
        message: 'Names cannot begin with "Guest".'
      });
    } else {
      if (usersState.isAvailable(name)) {
        var previousName = usersState.getUserBySocket(socket);
        usersState.rename(socket, name);
        socket.emit('set-name-result', {
          success: true,
          name: name
        });
        var broadcastConv = convState.getConversationBySocket(socket);
        socket.broadcast.to(broadcastConv).emit('name-changed', {
          previousName: previousName,
          newName: name,
        });
      } else {
        socket.emit('set-name-result', {
          success: false,
          message: 'That name is already in use.'
        });
      }
    }
  });
}

function handleFetchUsers(socket) {
  socket.on('fetch-users', function() {
    logger.debug('%s fetching users', socket.id);
    module.exports.sendUsersInConversation(socket);
  });
}

exports.sendUsersInConversation = function(socket) {
  logger.debug('%s sending users in conversation.', socket.id);
  var conversation = convState.getConversationBySocket(socket);
  if (conversation) {
    logger.debug('%s sending users for conversation with id %s', socket.id, conversation.id, {});
    var clientsInConversation = io.sockets.clients(conversation.id);
    var users = [];
    for (var index in clientsInConversation) {
      var clientSocket = clientsInConversation[index];
      users.push(usersState.getUserBySocket(clientSocket));
    }
    logger.debug('%s users: %j', socket.id, users, {});
    socket.emit('fetch-users-result', users);
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
        'user-left', usersState.getUserBySocket(socket));
    }
    convState.removeConversationBySocket(socket);
    usersState.onUserDisconnect(socket);
  });
};
