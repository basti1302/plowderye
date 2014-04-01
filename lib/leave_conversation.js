'use strict';

var logger            = require('./logger')
  , messageUtil       = require('./message_util')
  , sendConversations = require('./send_conversations')
  , storage           = require('./storage')
  ;

exports.leave = function(request, conversationId) {
  storage.fetchConversation(conversationId, function(err, conversation) {
    if (err) { return logger.error(err); }
    if (conversation) {
      logger.debug('%s (%s) leaves %j', request.id, request.user.nick, conversation, {});
      delete request.user.conversations[conversationId];
      request.socket.leave(conversation.id);
      messageUtil.broadcast(request.socket, conversation, 'user-left', request.id);
      storage.storeUser(request.user, function() {
        sendConversations(request);
      });
    }
  });
};
