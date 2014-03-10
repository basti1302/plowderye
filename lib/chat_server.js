'use strict';

var socketio = require('socket.io');
var io;

var uuid = require('node-uuid');
var cookieParser = require('cookie');

var storage = require('./storage');

var guestNumber = 1;
var nickNames = {};
var namesUsed = [];

var conversations = null;
var currentConversation = {};

exports.listen = function(server) {
  io = socketio.listen(server);
  io.set('log level', 1);

  storage.getConversations(function(err, _conversations) {
    conversations = _conversations;
  });

  io.sockets.on('connection', function (socket) {
    var userData = getDataFromCookie(socket);
    getInitialNick(socket, userData.nick);
    joinConversation(socket, userData.conversation);
    handleMessageBroadcasting(socket, nickNames);
    handleNameChangeAttempts(socket, nickNames, namesUsed);
    handleConversationJoining(socket);
    handleFetchRequests(socket);
    sendConfig(socket, userData);
    sendConversations(socket);
  });
};

function getDataFromCookie(socket) {
  var userData = {
    conversation: 'Lobby',
    soundEnabled: true,
    notificationsEnabled: false,
  };
  var cookieString = socket.handshake.headers['cookie'];
  if (!cookieString) {
    return userData;
  }
  var cookie = cookieParser.parse(cookieString);
  if (!cookie) {
    return userData;
  }
  userData.nick = cookie.nick;
  userData.conversation = cookie.conversation || userData.conversation;
  if (cookie.sound != null) {
    userData.soundEnabled = cookie.sound === 'true';
  }
  if (cookie.notifications != null) {
    userData.notificationsEnabled = cookie.notifications === 'true';
  }
  return userData;
}

function getInitialNick(socket, nickFromCookie) {
  var nick;
  if (nickFromCookie && !namesUsed[nickFromCookie]) {
    nick = nickFromCookie;
  } else {
    var nick = 'Guest' + guestNumber;
    guestNumber++;
  }
  nickNames[socket.id] = nick;
  socket.emit('set-name-result', {
    success: true,
    name: nick,
  });
  namesUsed.push(nick);
}

function joinConversation(socket, conversation) {
  if (conversations && !conversations[conversation]) {
    var newConversation = { id: conversation };
    conversations[conversation] = newConversation;
    storage.storeConversation(newConversation);
  }
  socket.join(conversation);
  currentConversation[socket.id] = conversation;
  socket.emit('join-result', { conversation: conversation });
  socket.broadcast.to(conversation).emit('message', createSystemMessage(
    nickNames[socket.id] + ' has joined ' + conversation + '.'
  ));

  storage.getMessagesStream(conversation).on('data', function(message) {
    socket.emit('message', message);
  }).on('close', function() {
    sendUsers(socket, conversation);
  });
}

function handleNameChangeAttempts(socket, nickNames, namesUsed) {
  socket.on('set-name', function(name) {
    if (name.indexOf('Guest') == 0) {
      socket.emit('set-name-result', {
        success: false,
        message: 'Names cannot begin with "Guest".'
      });
    } else {
      if (namesUsed.indexOf(name) == -1) {
        var previousName = nickNames[socket.id];
        var previousNameIndex = namesUsed.indexOf(previousName);
        namesUsed.push(name);
        nickNames[socket.id] = name;
        delete namesUsed[previousNameIndex];
        socket.emit('set-name-result', {
          success: true,
          name: name
        });
        socket.broadcast.to(currentConversation[socket.id]).emit(createSystemMessage(
          previousName + ' is now known as ' + name + '.'
        ));
      } else {
        socket.emit('set-name-result', {
          success: false,
          message: 'That name is already in use.'
        });
      }
    }
  });
}

function handleMessageBroadcasting(socket) {
  socket.on('message', function (message) {
    pimpMessage(message, socket.id);
    socket.broadcast.to(message.conversation).emit('message', message);
    storage.storeMessage(message);
  });
}

function handleConversationJoining(socket) {
  socket.on('join', function(conversation) {
    socket.leave(currentConversation[socket.id]);
    joinConversation(socket, conversation.newConversation);
  });
}

function handleFetchRequests(socket) {
  socket.on('fetch-users', function() {
    sendUsers(socket, currentConversation[socket.id]);
  });
  socket.on('fetch-conversations', function() {
    sendConversations(socket);
 });
}

function handleClientDisconnection(socket) {
  socket.on('disconnect', function() {
    var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
    delete namesUsed[nameIndex];
    delete nickNames[socket.id];
  });
}

function sendConversations(socket) {
  var conversationNames = [];
  for (var conversationId in conversations) {
    conversationNames.push(conversationId);
  }
  socket.emit('fetch-conversations-result', conversationNames);
}

function sendUsers(socket, conversation) {
  var usersInConversation = io.sockets.clients(conversation);
  var users = [];
  for (var index in usersInConversation) {
    var userSocketId = usersInConversation[index].id;
    users.push(nickNames[userSocketId]);
  }
  socket.emit('fetch-users-result', users);
}

function sendConfig(socket, userData) {
  if (!userData.soundEnabled) {
    socket.emit('set-sound-enabled', false);
  }
  if (userData.notificationsEnabled) {
    socket.emit('set-notifications-enabled', true);
  }
}

function createSystemMessage(text) {
  var message = {
    sender: '::',
    text: text,
    system: true,
  }
  addIdAndTime(message);
  return message;
}

function pimpMessage(message, senderSocketId) {
  message.sender = nickNames[senderSocketId];
  addIdAndTime(message);
  return message;
}

function addIdAndTime(message) {
  message.serverTime = Date.now();
  message.id = message.serverTime + '-' + randomString();
  return message;
}

function randomString()  {
  return ('' + Math.random()).substr(2, 4);
}
