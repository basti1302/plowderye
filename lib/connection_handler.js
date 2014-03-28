'use strict';

var _       = require('lodash')
  , async    = require('async')
  , nconf   = require('nconf')
  , socketio = require('socket.io')
  ;

var createConversationHandler = require('./handler/create_conversation')
  , initConversation = require('./init_conversation')
  , initUser = require('./init_user')
  , logger = require('./logger')
  , Request = require('./request')
  , router = require('./router')
  ;

var io;

global.defaultConversationName = nconf.get('default-conversation-name');
logger.info('name of default conversation: %s', global.defaultConversationName);

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
    console.log('plowderye: server started');
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

  async.waterfall([
    _.curry(initUser.onNewConnection)(socket),
    _.curry(handleUserComingOnline)(socket),
    initConversation.onNewConnection,
    ],
    finishOnNewConnection
  );
}

function handleUserComingOnline(socket, user, callback) {
  router.onNewConnection(socket, user);
  var request = new Request(user.id, user, socket);
  callback(null, request);
}

function finishOnNewConnection(err, request, conversation) {
  if (err) {
    logger.error(err);
    request.socket.disconnect();
    return;
  }

  if (!conversation) {
    // TODO Having no conversation should be a valid state
    logger.error('%s Can\'t acquire valid initial conversation, disconnecting client.', request.user.id);
    request.socket.disconnect();
  } else {
    logger.debug('%s Successfully acquired initial conversation.', request.user.id);
  }
}
