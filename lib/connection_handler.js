'use strict';

var socketio = require('socket.io');
var io;

var conversations = require('./conversations');
var convState = require('./conversations_state');
var logger = require('./logger');
var users = require('./users');
var usersState = require('./users_state');
var messages = require('./messages');

exports.listen = function(server) {

  convState.init();
  usersState.init();

  io = socketio.listen(server);
  io.set('log level', 1);

  conversations.setIo(io);
  users.setIo(io);

  io.sockets.on('connection', function (socket) {
    logger.debug('%s new connection', socket.id);

    if (!convState.hasLoaded()) {
      logger.info('%s rejecting connection because initialization is not complete.', socket.id);
      socket.disconnect();
      return;
    }

    var user = users.onNewConnection(socket);
    logger.debug('%s initialised user: %j', socket.id, user, {});
    var conversation =
      conversations.onNewConnection(socket, { id: user.conversationId });
    if (conversation) {
      logger.debug('%s Successfully acquired initial conversation.', socket.id);
      messages.onNewConnection(socket);
    } else {
      logger.error('%s Can\'t acquire valid initial conversation, disconnecting client.', socket.id);
      socket.disconnect();
      return;
    }
  });
};
