'use strict';

var socketio = require('socket.io');
var io;

var uuid = require('node-uuid');
var cookieParser = require('cookie');

var storage = require('./storage');

var guestNumber = 1;
var nickNames = {};
var namesUsed = [];

var rooms = null;
var currentRoom = {};

exports.listen = function(server) {
  io = socketio.listen(server);
  io.set('log level', 1);

  storage.getRooms(function(err, _rooms) {
    rooms = _rooms;
  });

  io.sockets.on('connection', function (socket) {
    var userData = getDataFromCookie(socket);
    getInitialNick(socket, userData.nick);
    joinRoom(socket, userData.room);
    handleMessageBroadcasting(socket, nickNames);
    handleNameChangeAttempts(socket, nickNames, namesUsed);
    handleRoomJoining(socket);
    handleFetchRequests(socket);

    // initially populate client's conversation list
    if (!userData.soundEnabled) {
      socket.emit('set-sound-enabled', false);
    }
    sendRooms(socket);
  });
};

function getDataFromCookie(socket) {
  var userData = {
    room: 'Lobby',
    soundEnabled: true,
  };
  var cookieString = socket.handshake.headers['cookie'];
  console.log('cookieString: ' + cookieString);
  if (!cookieString) {
    return userData;
  }
  var cookie = cookieParser.parse(cookieString);
  console.log('cookie');
  console.log(JSON.stringify(cookie, null, 2));
  if (!cookie) {
    return userData;
  }
  userData.nick = cookie.nick;
  userData.room = cookie.room || userData.room;
  userData.soundEnabled = cookie.sound || userData.soundEnabled;
  console.log('userData');
  console.log(JSON.stringify(userData, null, 2));
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

function joinRoom(socket, room) {
  if (rooms && !rooms[room]) {
    var newRoom = { id: room };
    rooms[room] = newRoom;
    storage.storeRoom(newRoom);
  }
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

function handleFetchRequests(socket) {
  socket.on('fetch-users', function() {
    sendUsers(socket, currentRoom[socket.id]);
  });
  socket.on('fetch-rooms', function() {
    sendRooms(socket);
 });
}

function handleClientDisconnection(socket) {
  socket.on('disconnect', function() {
    var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
    delete namesUsed[nameIndex];
    delete nickNames[socket.id];
  });
}

function sendRooms(socket) {
  var roomNames = [];
  for (var roomId in rooms) {
    roomNames.push(roomId);
  }
  socket.emit('fetch-rooms-result', roomNames);
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

function createSystemMessage(text) {
  var message = {
    sender: '::',
    text: text,
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
