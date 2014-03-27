'use strict';

var addUserToConversation = require('./add_user_to_conversation');
var logger = require('./logger');
var storage = require('./storage');

exports.onNewConnection = function(request, conversationId, callback) {
  findInitialConversation(request, conversationId, function(err, conversation) {
    if (err) { return callback(err); }
    if (!conversation) {
      return callback(null, null);
    }
    addUserToConversation.add(request, conversation);
    sendConversations(request);
    return callback(null, conversation);
  });
};

function findInitialConversation(request, conversationId, callback) {
  logger.debug('%s Trying initial conversation %s.', request.id, conversationId);
  if (conversationId == null) {
    logger.debug('%s No stored conversation id.', request.id);
    return storage.findConversationByName(global.defaultConversationName, callback);
  }

  storage.fetchConversation(conversationId, function(err, conversation) {
    if (err) { return callback(err); }
    if (conversation) {
      logger.debug('%s Using stored initial conversation: %s.', request.id, conversation.id);
      return callback(null, conversation);
    } else {
      logger.debug('%s Stored conversation does not exist: %s', request.id, conversationId);
      return storage.findConversationByName(global.defaultConversationName, callback);
    }
  });
}

function sendConversations(request) {
  storage.fetchConversationsForUser(request.user, function(err, conversations) {
    if (err) { return logger.error(err); }
    logger.debug('%s sendConversations %j', request.id, conversations, {});
    request.socket.emit('fetch-conversations-result', conversations);
  });
}
