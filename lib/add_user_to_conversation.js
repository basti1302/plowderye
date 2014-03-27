'use strict';

var logger = require('./logger');
var messageUtil = require('./message_util');
var storage = require('./storage');
var userFilter = require('./user_filter');
var usersInConversation = require('./users_in_conversation');

exports.add = function(request, conversation) {
  logger.debug('%s addUserToConversation: %j', request.id, conversation, {});
  request.user.conversationId = conversation.id;
  storage.storeUser(request.user);

  request.socket.join(conversation.id);
  request.socket.emit('join-result', { conversation: conversation });

  // TODO Get rid of this broadcast and let client render information in chat
  // log triggered by 'user-joined' event.
  messageUtil.broadcast(request.socket, conversation, 'message',
    messageUtil.createSystemMessage(
      request.user.nick + ' has joined ' + conversation.name + '.'
  ));
  // TODO Maybe send only id and nick of users
  messageUtil.broadcast(request.socket, conversation, 'user-joined', userFilter.filter(request.user));

  // send all old messages - for now. TODO: Only send a few old messages and let
  // client ask for even older ones.
  storage.messagesStream(conversation).on('data', function(message) {
    request.socket.emit('message', message);
  });

  usersInConversation.send(request);
};
