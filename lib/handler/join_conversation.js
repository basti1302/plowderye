'use strict';

var conversations = require('../conversations');
var logger = require('../logger');

module.exports = function(request, conversation) {
  if (conversation) {
    conversations.leaveCurrentConversation(request);
    logger.debug('%s joins %j', request.id, conversation, {});
    conversations.joinConversation(request, conversation);
  }
};
