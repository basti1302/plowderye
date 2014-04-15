'use strict';

var addUserToConversation = require('../add_user_to_conversation')
  , createConversation    = require('../create_conversation').createConversation
  , logger                = require('../logger')
  , storage               = require('../storage')
  ;

// TODO Why should the client wrap the conversation's name in an object. Makes
// no sense. Refactor to only send conversation name.
module.exports = function(request, _conversation) {
  if (!_conversation || !_conversation.name) {
    return logger.error('%s Client provided no conversation name when trying to create a new conversation. Ignoring create request.', request.id, {});
  }

  logger.debug('%s creates %j', request.id, _conversation, {});
  createConversation(request, {
    name: _conversation.name,
    private: false,
  }, function(err, conversation) {
    if (err) { return logger.error(err); }
    addUserToConversation(request, conversation);
  });
};


