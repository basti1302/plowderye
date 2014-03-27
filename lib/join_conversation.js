'use strict';

var addUserToConversation = require('./add_user_to_conversation');
var logger = require('./logger');
var messageUtil = require('./message_util');
var storage = require('./storage');

exports.join = function(request, _conversation) {
  logger.debug('%s joining conversation %j', request.id, _conversation, {});
  if (_conversation.id) {
    storage.fetchConversation(_conversation.id, function(err, conversation) {
      if (err) { return logger.error(err); }
      addUserToConversation.addIfFound(request, conversation);
    });
  } else if (_conversation.name) {
    storage.findConversationByNameCaseInsensitive(_conversation.id, function(err, conversation) {
      if (err) { return logger.error(err); }
      if (conversation) {
        addUserToConversation.addIfFound(request, conversation);
      }
    });
  }
};

function addUserToConversation.addIfFound(request, conversation) {
  if (conversation == null) {
    logger.warn('%s Can\'t find matching conversation for conversation id %s or conversation name %s. Ignoring join request.', request.id, _conversation.id, _conversation.name);
    return;
  }
  addUserToConversation.add(request, conversation);
}

exports.leaveCurrentConversation = function(request) {
  storage.fetchConversation(request.user.conversationId, function(err, conversation) {
    if (err) { return logger.error(err); }
    logger.debug('%s (%s) leaves %j', request.id, request.user.nick, conversation, {});
    messageUtil.broadcast(request.socket, conversation, 'user-left', request.id);
    request.socket.leave(conversation.id);
  });
};
