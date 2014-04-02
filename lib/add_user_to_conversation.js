'use strict';

var logger              = require('./logger')
  , messageUtil         = require('./message_util')
  , storage             = require('./storage')
  , userFilter          = require('./user_filter')
  , usersInConversation = require('./users_in_conversation')
  ;

module.exports = function(request, conversation) {
  logger.debug('%s addUserToConversation: %j', request.id, conversation, {});

  if (!request.user.conversations[conversation.id]) {
    // the user did not participate in this conversation before, so they truly
    // joined.
    request.user.conversations[conversation.id] = {};
    storage.storeUser(request.user);

    var userJoinedData = userFilter.filter(request.user);
    userJoinedData.conversation = conversation.id;
    logger.debug('%s broadcasting user-joined: %j', request.id, userJoinedData,
      {});
    messageUtil.broadcast(request.socket, conversation, 'user-joined',
      userJoinedData);
  }

  request.socket.join(conversation.id);
  request.socket.emit('join-result', { conversation: conversation });

  // send all old messages - for now. TODO: Only send a few old messages and let
  // client ask for even older ones.
  storage.messagesStream(conversation).on('data', function(message) {
    request.socket.emit('message', message);
  });

  usersInConversation.send(request, conversation);
};
