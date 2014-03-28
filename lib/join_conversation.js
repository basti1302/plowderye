'use strict';

var addUserToConversation = require('./add_user_to_conversation')
  , logger                = require('./logger')
  , messageUtil           = require('./message_util')
  , storage               = require('./storage')
  ;

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
