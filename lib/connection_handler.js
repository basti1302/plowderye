'use strict';

var _        = require('lodash')
  , async    = require('async')
  , nconf    = require('nconf')
  , socketio = require('socket.io')
  ;

var createDefaultConversation = require('./create_conversation').createDefaultConversation
  , initConversations         = require('./init_conversations')
  , initRoutes                = require('./init_routes')
  , initUser                  = require('./init_user')
  , logger                    = require('./logger')
  , Request                   = require('./request')
  , sendUsers                 = require('./send_users')
  , socketRegistry            = require('./socket_registry')
  ;

var io;

global.defaultConversationName = nconf.get('default-conversation-name');
logger.info('name of default conversation: %s', global.defaultConversationName);

exports.listen = function(server) {
  async.series([
    function(callback){
      createDefaultConversation(callback);
    },
    function(callback){
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

  var request;
  async.waterfall([
      _.curry(initUser.onNewConnection)(socket),
      _.curry(createRequest)(socket),
      initRoutes.onNewConnection,
      initConversations.onNewConnection,
      sendUsers,
    ],
    finishOnNewConnection
  );
}

function createRequest(socket, user, callback) {
  var request = new Request(user.id, user, socket);
  callback(null, request);
}

function finishOnNewConnection(err, request) {
  if (err) {
    logger.error(err);
    request.socket.disconnect();
    return;
  }
  socketRegistry.store(request.id, request.socket.id);
  logger.debug('%s Successfully handled incoming new connection.', request.user.id);
}
