'use strict';

var addUserToConversation = require('../add_user_to_conversation')
  , logger                = require('../logger')
  , storage               = require('../storage')
  ;

module.exports = function(request, data) {
  storage.fetchConversation(data.conversationId, function(err, conversation) {
    if (err) { return logger.error(err); }
    storage.fetchUserByName(data.userName, function(err, user) {
      if (err) {
        if (err.notFound) {
          // TODO Send something back to the user from whom the request
          // originated, to let them know it didn't work out because the user
          // has not been found.
          logger.info('%s Could not add user to conversation %s/%s because ' +
            'no user with this name exists: %s', request.id, conversation.id,
            conversation.name, data.userName);
          return;
        }
        return logger.error(err);
      }

      addUserToConversation(request, conversation, user);
    });
  });
};
