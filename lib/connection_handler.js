'use strict';

var _ = require('lodash');
var async = require('async');
var socketio = require('socket.io');
var io;

var createConversationHandler = require('./handler/create_conversation');
var initConversation = require('./init_conversation');
var initUser = require('./init_user');
var logger = require('./logger');
var Request = require('./request');
var router = require('./router');

// TODO Make this configurable
global.defaultConversationName = 'Lobby';

exports.listen = function(server) {
  async.series([
    function(callback){
      logger.debug('about to initialize');
      createConversationHandler.createDefaultConversation(callback);
    },
    function(callback){
      logger.debug('finished initialization - about to start server');
      startSocketServer(server, callback);
    }
  ], function(err, results) {
    if (err) {
      logger.error('could not start server.');
      logger.error(err);
      return;
    }
    logger.info('plowderye: server started');
  });
};

function startSocketServer(server, callback) {
  io = socketio.listen(server);
  io.set('log level', 1);
  global.io = io;
  io.sockets.on('connection', onNewConnection);
  callback(null);
}

function onNewConnection(socket) {
  logger.debug('%s new connection', socket.id);

  // TODO Use async.waterfall !!!!
  initUser.onNewConnection(socket, _.curry(handleUserComingOnline)(socket));
}

function handleUserComingOnline(socket, err, user) {
  if (err) {
    logger.error(err);
    socket.disconnect();
    return;
  }
  router.onNewConnection(socket, user);
  var request = new Request(user.id, user, socket);
  initConversation.onNewConnection(request, user.conversationId,
    _.curry(handleUserJoiningConversations)(socket, user));
}

function handleUserJoiningConversations(socket, user, err, conversation) {
  if (err) {
    logger.error(err);
    socket.disconnect();
    return;
  }
  if (!conversation) {
    // TODO Having no conversation should be a valid state
    logger.error('%s Can\'t acquire valid initial conversation, disconnecting client.', socket.id);
    socket.disconnect();
  } else {
    logger.debug('%s Successfully acquired initial conversation.', user.id);
  }
}
