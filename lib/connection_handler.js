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

    // TODO Remove this stuff and similar checks (all over the place) - use
    // async to to load all required state before starting socket.io listening.
    // Also, better do not hold state at all but hit leveldb on each socket
    // event to get all required data!
    if (!convState.hasLoaded()) {
      logger.info('%s rejecting connection because initialization is not complete.', socket.id);
      socket.disconnect();
      return;
    }

    users.onNewConnection(socket, function(user) {
      var id = user.id;
      var conversation =
        conversations.onNewConnection(id, socket, { id: user.conversationId });
      if (conversation) {
        logger.debug('%s Successfully acquired initial conversation.', id);
        messages.onNewConnection(id, socket);
      } else {
        logger.error('%s Can\'t acquire valid initial conversation, disconnecting client.', socket.id);
        socket.disconnect();
      }
    });
  });
};
