'use strict';

var leaveConversation = require('../leave_conversation')
  , logger            = require('../logger')
  ;

module.exports = function(request, conversationId) {
  if (conversationId) {
    logger.debug('%s leaves %j', request.id, conversationId, {});
    leaveConversation.leave(request, conversationId);
  }
};
