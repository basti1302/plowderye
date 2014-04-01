'use strict';

var logger              = require('./logger')
  , messageUtil         = require('./message_util')
  , storage             = require('./storage')
  , userFilter          = require('./user_filter')
  , usersInConversation = require('./users_in_conversation')
  ;

module.exports = function(request, conversation) {
  logger.debug('%s addUserToConversation: %j', request.id, conversation, {});
  request.user.conversations[conversation.id] = {};
  storage.storeUser(request.user);

  request.socket.join(conversation.id);
  request.socket.emit('join-result', { conversation: conversation });
  messageUtil.broadcast(request.socket, conversation, 'user-joined', userFilter.filter(request.user));

  // send all old messages - for now. TODO: Only send a few old messages and let
  // client ask for even older ones.
  storage.messagesStream(conversation).on('data', function(message) {
    request.socket.emit('message', message);
  });

  usersInConversation.send(request, conversation);
};
