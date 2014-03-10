'use strict';

var socketio = require('socket.io');
var io;

var uuid = require('node-uuid');

var users = require('./users');
var conversations = require('./conversations');
var messages = require('./messages');
var storage = require('./storage');

exports.listen = function(server) {
  conversations.readConversations();

  io = socketio.listen(server);
  io.set('log level', 1);

  io.sockets.on('connection', function (socket) {
    var conversation = users.onNewConnection(socket, io);
    conversations.onNewConnection(socket, conversation);
    messages.onNewConnection(socket);
  });
};
