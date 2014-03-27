'use strict';

var logger = require('./logger');
var messageUtil = require('./message_util');
var storage = require('./storage');

exports.leaveCurrentConversation = function(request) {
  storage.fetchConversation(request.user.conversationId, function(err, conversation) {
    if (err) { return logger.error(err); }
    logger.debug('%s (%s) leaves %j', request.id, request.user.nick, conversation, {});
    messageUtil.broadcast(request.socket, conversation, 'user-left', request.id);
    request.socket.leave(conversation.id);
  });
};
