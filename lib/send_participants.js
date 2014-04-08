'use strict';

var _            = require('lodash')
  , cookieParser = require('cookie')
  ;

var logger       = require('./logger')
  , storage      = require('./storage')
  , userFilter   = require('./user_filter')
  ;

module.exports = function(request, conversation) {
  var id = request.id;
  var socket = request.socket;
  logger.debug('%s retrieving user objects for conversation with id %s', request.id, conversation.id);

  storage.fetchUsersInConversation(conversation.id, function(err, participants) {
    if (err) { return logger.error(err); }
    logger.debug('%s users in conversation %s: %j', request.id, conversation.id, participants, {});
    participants = _.transform(participants, function(result, usr, key) {
      result[key] = userFilter.filterExcept(request.user.id, usr);
    });
    // always add the current user as complete object - if the user has just
    // joined the conversation, their id might not have been added to the
    // user list for the conversation yet, as this happens asynchronously.
    participants[request.id] = request.user;
    logger.debug('%s users in conversation %s: %j', request.id, conversation.id, participants, {});

    var participantData = {
      conversationId: conversation.id,
      participants: participants,
    };
    socket.emit('participant-list', participantData);
  });
}
