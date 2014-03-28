'use strict';

var logger = require('./logger');
var messageUtil = require('./message_util');
var storage = require('./storage');

exports.leaveConversation = function(request, conversationId) {
  storage.fetchConversation(conversationId, function(err, conversation) {
    if (err) { return logger.error(err); }
    if (conversation) {
      logger.debug('%s (%s) leaves %j', request.id, request.user.nick, conversation, {});
      delete request.user.conversations[conversationId];
      request.socket.leave(conversation.id);
      messageUtil.broadcast(request.socket, conversation, 'user-left', request.id);
    }
  });
};
