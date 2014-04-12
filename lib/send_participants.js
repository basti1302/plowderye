'use strict';

var _            = require('lodash')
  , cookieParser = require('cookie')
  ;

var logger       = require('./logger')
  , storage      = require('./storage')
  , userFilter   = require('./user_filter')
  ;

module.exports = function(request, conversation, socket, user) {
  var id;
  if (user) {
    id = user.id;
  } else {
    id = request.id;
    user = request.user;
  }
  if (!socket) {
    socket = request.socket;
  }
  logger.debug('%s retrieving user objects for conversation with id %s', id, conversation.id);

  storage.fetchUsersInConversation(conversation.id, function(err, participants) {
    if (err) { return logger.error(err); }
    logger.debug('%s users in conversation %s: %j', id, conversation.id, participants, {});
    participants = _.transform(participants, function(result, _user, key) {
      result[key] = userFilter.filterExcept(id, _user);
    });
    // always add the current user as complete object - if the user has just
    // joined the conversation, their id might not have been added to the
    // user list for the conversation yet, as this happens asynchronously.
    participants[id] = user;
    logger.debug('%s users in conversation %s: %j', id, conversation.id, participants, {});

    var participantData = {
      conversationId: conversation.id,
      participants: participants,
    };
    socket.emit('participant-list', participantData);
  });
}
