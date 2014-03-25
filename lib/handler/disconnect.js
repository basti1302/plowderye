'use strict';

var convState = require('../conversations_state');
var logger = require('../logger');
var messageUtil = require('../message_util');
var storage = require('../storage');

module.exports = function(request) {
  logger.debug('%s (%s) will disconnect', request.id, request.user.nick);
  request.user.online = false;
  storage.storeUser(request.user);
  var conv = convState.getConversationById(request.user.conversationId);
  if (conv) {
    messageUtil.broadcast(request.socket, conv, 'user-went-offline', request.id);
  }
};
