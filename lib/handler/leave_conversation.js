'use strict';

var logger            = require('../logger')
  , messageUtil       = require('../message_util')
  , sendConversations = require('../send_conversations')
  , storage           = require('../storage')
  , userFilter        = require('../user_filter')
  ;

module.exports = function(request, conversationId) {
  if (!conversationId) {
    return;
  }

  storage.fetchConversation(conversationId, function(err, conversation) {
    if (err) { return logger.error(err); }
    if (conversation) {
      logger.debug('%s (%s) leaves %j', request.id, request.user.nick, conversation, {});
      delete request.user.conversations[conversationId];
      storage.removeFromConversationUserList(conversationId, request.id);
      request.socket.leave(conversation.id);
      messageUtil.broadcast(request.socket, conversation, 'user-left', {
        conversationId: conversationId,
        user: userFilter.filter(request.user),
      });
      storage.storeUser(request.user, function() {
        sendConversations(request);
      });
    }
  });
};
