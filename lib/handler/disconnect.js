'use strict';

var forEachConv    = require('../for_each_conversation')
  , logger         = require('../logger')
  , messageUtil    = require('../message_util')
  , socketRegistry = require('../socket_registry')
  , storage        = require('../storage')
  ;

module.exports = function(request) {
  logger.debug('%s (%s) will disconnect', request.id, request.user.nick);
  request.user.online = false;
  storage.storeUser(request.user);
  forEachConv(request, function(conversation) {
    messageUtil.broadcast(request.socket, conversation, 'user-went-offline',
      request.id);
  });
  socketRegistry.remove(request.id);
};
