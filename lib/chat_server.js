'use strict';

var uuid = require('node-uuid');
var socketio = require('socket.io');
var io;

var storage = require('./storage');

var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

exports.listen = function(server) {
  io = socketio.listen(server);
  io.set('log level', 1);

  // TODO load existing public rooms from levelDB

  io.sockets.on('connection', function (socket) {
    var userData = getDataFromCookie(socket);
    getInitialNick(socket, userData.nick);
    if (!userData.soundEnabled) {
      socket.emit('set-sound-enabled', false);
    }
    joinRoom(socket, userData.room);
    handleMessageBroadcasting(socket, nickNames);
    handleNameChangeAttempts(socket, nickNames, namesUsed);
    handleRoomJoining(socket);

    socket.on('fetch-users', function() {
      sendUsers(socket, currentRoom[socket.id]);
    });

    socket.on('fetch-rooms', function() {
      socket.emit('fetch-rooms-result', io.sockets.manager.rooms);
    });

    handleClientDisconnection(socket, nickNames, namesUsed);

    // initially populate client's conversation list
    socket.emit('fetch-rooms-result', io.sockets.manager.rooms);
  });
};

function getDataFromCookie(socket) {
  var userData = {
    room: 'Lobby',
    soundEnabled: true,
  };
  var cookieString = socket.handshake.headers['cookie'];
  if (!cookieString) {
    return userData;
  }
  var cookies = cookieString.split(';');
  if (!cookies) {
    return userData;
  }
  cookies.forEach(function(cookie) {
    var kv = getKeyValue(cookie);
    if (kv) {
      if (kv.key === 'nick') {
        userData.nick = kv.value;
      } else if (kv.key === 'room') {
        userData.room = kv.value;
      } else if (kv.key === 'sound') {
        userData.soundEnabled = (kv.value === 'true');
      }
    }
  });
  return userData;
}

function getKeyValue(cookie) {
  if (!cookie) {
    return null;
  }
  var i = cookie.indexOf('=');
  if (i > 0) {
    return {
      key: cookie.substring(0, i).trim(),
      value: cookie.substring(i + 1).trim(),
    };
  } else {
    return null;
  }
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

function joinRoom(socket, room) {
  socket.join(room);
  currentRoom[socket.id] = room;
  socket.emit('join-result', { room: room });
  socket.broadcast.to(room).emit('message', createSystemMessage(
    nickNames[socket.id] + ' has joined ' + room + '.'
  ));

  storage.getMessagesStream(room).on('data', function(message) {
    socket.emit('message', message);
  }).on('close', function() {
    sendUsers(socket, room);
  });
}

function sendUsers(socket, room) {
  var usersInRoom = io.sockets.clients(room);
  var users = [];
  for (var index in usersInRoom) {
    var userSocketId = usersInRoom[index].id;
    users.push(nickNames[userSocketId]);
  }
  socket.emit('fetch-users-result', users);
}

function handleNameChangeAttempts(socket, nickNames, namesUsed) {
  socket.on('set-name-attempt', function(name) {
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
        socket.broadcast.to(currentRoom[socket.id]).emit(createSystemMessage(
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
    socket.broadcast.to(message.room).emit('message', message);
    storage.storeMessage(message);
  });
}

function handleRoomJoining(socket) {
  socket.on('join', function(room) {
    socket.leave(currentRoom[socket.id]);
    joinRoom(socket, room.newRoom);
  });
}

function handleClientDisconnection(socket) {
  socket.on('disconnect', function() {
    var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
    delete namesUsed[nameIndex];
    delete nickNames[socket.id];
  });
}

function createSystemMessage(text) {
  var message = {
    sender: '::',
    text: text,
  }
  addIdAndTime(message);
  return message;
}

function pimpMessage(message, fromId) {
  message.sender = nickNames[fromId];
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
