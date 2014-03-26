'use strict';

var async = require('async');
var socketio = require('socket.io');
var io;

var conversations = require('./conversations');
var logger = require('./logger');
var Request = require('./request');
var router = require('./router');
var initUser = require('./init_user');

exports.listen = function(server) {
  async.series([
    function(callback){
      logger.debug('about to initialize');
      conversations.init(callback);
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

  conversations.setIo(io);

  io.sockets.on('connection', function (socket) {
    logger.debug('%s new connection', socket.id);

    // TODO Use async.waterfall !!!!
    initUser.onNewConnection(socket, function(err, user) {
      if (err) { return logger.error(err); }
      router.onNewConnection(socket, user);
      var request = new Request(user.id, user, socket);
      conversations.onNewConnection(request, user.conversationId, function(err, conversation) {
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
      });
    });
  });

  callback(null);
}
