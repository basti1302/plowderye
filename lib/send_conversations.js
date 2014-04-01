'use strict';

var _                      = require('lodash');

var fetchUserConversations = require('./fetch_user_conversations')
  , logger                 = require('./logger')
  , storage                = require('./storage')
  ;


module.exports = function(request) {
  fetchUserConversations(request,
    function(err, request, conversations) {
      if (err) { return logger.error(err); }
      // convert conversations array into object { id => conversation }
      conversations = _.zipObject(_.pluck(conversations, 'id'), conversations);
      logger.debug('%s sending user\'s conversations %j', request.id, conversations, {});
      request.socket.emit('user-conversation-list', conversations);
    }
  );

  storage.fetchPublicConversations(request.user, function(err, conversations) {
    if (err) { return logger.error(err); }
    logger.debug('%s sending public conversations %j', request.id, conversations, {});
    request.socket.emit('public-conversation-list', conversations);
  });
};
