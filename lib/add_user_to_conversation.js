'use strict';

var logger           = require('./logger')
  , messageUtil      = require('./message_util')
  , storage          = require('./storage')
  , userFilter       = require('./user_filter')
  , sendParticipants = require('./send_participants')
  , socketRegistry   = require('./socket_registry')
  ;

module.exports = function(request, conversation, user, callback) {
  if (!user) {
    user = request.user;
  }
  logger.debug('%s addUserToConversation: %j', user.id, conversation, {});

  if (!user.conversations[conversation.id]) {
    // the user did not participate in this conversation before, so they truly
    // joined as a new participant.
    user.conversations[conversation.id] = {};
    storage.storeUser(user);
    storage.addToConversationUserList(conversation.id, user.id);

    var userJoinedData = {
      user: userFilter.filter(user),
      conversationId: conversation.id,
    };
    logger.debug('%s broadcasting user-joined: %j', user.id, userJoinedData,
      {});
    messageUtil.broadcast(request.socket, conversation, 'user-joined',
      userJoinedData);
  } else {
    // the user was already part of this conversation but was offline and is
    // just now coming back online again.
    messageUtil.broadcast(request.socket, conversation, 'user-coming-online',
      request.id);
  }

  var socket;
  if (user.id === request.id) {
    socket = request.socket;
  } else {
    logger.debug('Trying to find socket for user id %s', user.id);
    socket = socketRegistry.getSocket(request, user.id);
    if (socket) { logger.debug('Found: %s', socket.id); }
  }
  if (!socket) {
    logger.info('Can\'t immediately join %s to %s/%s, user has no socket.',
      user.id, conversation.id, conversation.name);
    return;
  }

  socket.join(conversation.id);
  socket.emit('join-result', { conversation: conversation });

  // send all old messages - for now. TODO: Only send a few old messages and
  // let client ask for even older ones.
  storage.messagesStream(conversation).on('data', function(message) {
    socket.emit('message-old', message);
  });

  sendParticipants(request, conversation, socket, user);
};
