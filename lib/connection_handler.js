'use strict';

var socketio = require('socket.io');
var io;

var conversations = require('./conversations');
var convState = require('./conversations_state');
var logger = require('./logger');
var Request = require('./request');
var router = require('./router');
var initUser = require('./init_user');

exports.listen = function(server) {

  convState.init();

  io = socketio.listen(server);
  io.set('log level', 1);

  conversations.setIo(io);

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

    initUser.onNewConnection(socket, function(err, user) {
      if (err) { return logger.error(err); }
      router.onNewConnection(socket, user);
      var request = new Request(user.id, user, socket);
      var conversation =
        conversations.onNewConnection(request, user.conversationId);
      if (conversation) {
        logger.debug('%s Successfully acquired initial conversation.', user.id);
      } else {
        // TODO Having no conversation should be a valid state
        logger.error('%s Can\'t acquire valid initial conversation, disconnecting client.', socket.id);
        socket.disconnect();
      }
    });
  });
};
