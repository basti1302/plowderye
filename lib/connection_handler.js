'use strict';

var socketio = require('socket.io');
var io;

var uuid = require('node-uuid');

var conversations = require('./conversations');
var convState = require('./conversations_state');
var users = require('./users');
var usersState = require('./users_state');
var messages = require('./messages');

exports.listen = function(server) {

  convState.init();
  usersState.init();

  io = socketio.listen(server);
  io.set('log level', 1);

  io.sockets.on('connection', function (socket) {
    var conversation = users.onNewConnection(socket, io);
    conversations.onNewConnection(socket, conversation);
    messages.onNewConnection(socket);
  });
};
