'use strict';

var addUserToConversation = require('../add_user_to_conversation')
  , logger                = require('../logger')
  , storage               = require('../storage')
  ;

module.exports = function(request, conversation) {
  if (conversation) {
    logger.debug('%s joins %j', request.id, conversation, {});
    joinConversation(request, conversation);
  }
};

function joinConversation(request, _conversation) {
  logger.debug('%s joining conversation %j', request.id, _conversation, {});
  if (_conversation.id) {
    storage.fetchConversation(_conversation.id, function(err, conversation) {
      if (err) { return logger.error(err); }
      addUserToConversationIfFound(request, conversation);
    });
  } else if (_conversation.name) {
    storage.findConversationByNameCaseInsensitive(_conversation.name, function(err, conversation) {
      if (err) { return logger.error(err); }
      if (conversation) {
        addUserToConversationIfFound(request, conversation);
      }
    });
  }
};

function addUserToConversationIfFound(request, conversation) {
  if (conversation == null) {
    logger.warn('%s Can\'t find matching conversation for conversation id %s or conversation name %s. Ignoring join request.', request.id, _conversation.id, _conversation.name);
    return;
  }
  addUserToConversation.add(request, conversation);
}
