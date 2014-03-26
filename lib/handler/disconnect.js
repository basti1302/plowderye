'use strict';

var logger = require('../logger');
var messageUtil = require('../message_util');
var storage = require('../storage');

module.exports = function(request) {
  logger.debug('%s (%s) will disconnect', request.id, request.user.nick);
  request.user.online = false;
  storage.storeUser(request.user);
  storage.fetchConversation(request.user.conversationId, function(err, conversation) {
    if (err) { return logger.error(err); }
    messageUtil.broadcast(request.socket, conversation, 'user-went-offline', request.id);
  });
};
