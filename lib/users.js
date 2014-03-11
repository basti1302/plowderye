'use strict';

var cookieParser = require('cookie');

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
  return user.conversation;
};

function readCookie(socket) {
  var user = {
    conversation: 'Lobby',
    soundEnabled: true,
    notificationsEnabled: false,
  };
  var cookieString = socket.handshake.headers['cookie'];
  if (!cookieString) {
    return user;
  }
  var cookie = cookieParser.parse(cookieString);
  if (!cookie) {
    return user;
  }
  user.nick = cookie.nick;
  user.conversation = cookie.conversation || user.conversation;
  if (cookie.sound != null) {
    user.soundEnabled = cookie.sound === 'true';
  }
  if (cookie.notifications != null) {
    user.notificationsEnabled = cookie.notifications === 'true';
  }
  return user;
}

function assignInitialNick(socket, nickFromCookie) {
  var nick = usersState.getInitialNick(socket, nickFromCookie);
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
    module.exports.sendUsersInConversation(socket);
  });
}

exports.sendUsersInConversation = function(socket) {
  var conversation = convState.getConversationBySocket(socket);
  var usersInConversation = io.sockets.clients(conversation);
  var users = [];
  for (var index in usersInConversation) {
    var userSocket = usersInConversation[index];
    users.push(usersState.getUserBySocket(userSocket));
  }
  socket.emit('fetch-users-result', users);
}

function sendConfig(socket, user) {
  if (!user.soundEnabled) {
    socket.emit('set-sound-enabled', false);
  }
  if (user.notificationsEnabled) {
    socket.emit('set-notifications-enabled', true);
  }
}

function handleClientDisconnection(socket) {
  socket.on('disconnect', function() {
    messageUtil.broadcast(socket, convState.getConversationBySocket(socket),
      'user-left', usersState.getUserBySocket(socket));
    usersState.onUserDisconnect(socket);
  });
};
