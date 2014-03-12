'use strict';

var io;

var convState = require('./conversations_state');
var logger = require('./logger');
var messageUtil = require('./message_util');
var storage = require('./storage');
var users = require('./users');
var usersState = require('./users_state');

exports.setIo = function(_io) {
  io = _io;
};

exports.onNewConnection = function(socket, conversation) {
  conversation = findInitialConversation(socket, conversation);
  if (!conversation) {
    return null;
  }
  joinConversation(socket, { id: conversation.id });
  handleConversationJoining(socket);
  handleFetchConversations(socket);
  sendConversations(socket);
  return conversation;
};

function findInitialConversation(socket, conversation) {
  if (conversation != null && conversation.id != null) {
    if (convState.getConversationById(conversation.id)) {
      logger.debug('%s Using conversation from cookie: %s.', socket.id, conversation.id);
      return conversation;
    } else {
      logger.debug('%s Conversation from cookie does not exist: %j', socket.id, conversation, {});
    }
  } else {
    logger.debug('%s No conversation from cookie or no id: %j', socket.id, conversation, {});
  }

  logger.debug('%s Can\'t use conversation from cookie, will use default conversation.', socket.id);
  conversation = convState.getDefaultConversation();
  if (conversation) {
    return conversation;
  }

  // Can't acquire valid initial conversation, giving up. Client will be
  // disconnected immediately.
  return null;
}

function joinConversation(socket, _conversation) {
  logger.debug('%s joining conversation %j', socket.id, _conversation, {});
  // check if conversation has an id and a conversation with this id exists
  var conversation = null;
  if (_conversation.id) {
    conversation = convState.getConversationById(_conversation.id);
  }
  // if not, create a new conversation with the given name
  if (conversation == null) {
    if (_conversation.name) {
      conversation = convState.create(_conversation.name);
      io.sockets.emit('conversation-added', conversation);
    } else {
      // client gave no id or there is no conversation with the given id
      // AND client gave no name - ignore request altogether.
      logger.warn('%s No conversation id and no name given for creating a new conversation. Ignoring join request. %j', socket.id, _conversation, {});
      return;
    }
  }

  socket.join(conversation.id);
  convState.setConversationBySocket(socket, conversation);
  socket.emit('join-result', { conversation: conversation });

  // TODO Get rid of this broadcast and let client render information in chat
  // log triggered by 'user-joined' event.
  messageUtil.broadcast(socket, conversation, 'message',
    messageUtil.createSystemMessage(
      usersState.getUserBySocket(socket) + ' has joined ' + conversation.name + '.'
  ));
  messageUtil.broadcast(socket, conversation, 'user-joined',
    usersState.getUserBySocket(socket));

  // send all old messages - for now. TODO: Only send a few old messages and let
  // client ask for even older ones.
  storage.getMessagesStream(conversation).on('data', function(message) {
    socket.emit('message', message);
  });

  // TODO Currently, this call is the only reason conversations.js requires
  // users.js directly. I'd like to get rid of that. We should probably use more
  // eventing instead of function calls or whatnot.
  users.sendUsersInConversation(socket);
}

function handleConversationJoining(socket) {
  socket.on('join', function(conversation) {
    if (conversation) {
      leaveConversation(socket, convState.getConversationBySocket(socket));
      logger.debug('%s joins %j', socket.id, conversation, {});
      joinConversation(socket, conversation);
    }
  });
}

function leaveConversation(socket, conversation) {
  if (conversation) {
    logger.debug('%s leaves %j', socket.id, conversation, {});
    messageUtil.broadcast(socket, conversation,
        'user-left', usersState.getUserBySocket(socket));
    socket.leave(conversation.id);
    convState.removeConversationBySocket(socket);
  }
}

function handleFetchConversations(socket) {
  socket.on('fetch-conversations', function() {
    sendConversations(socket);
 });
}

function sendConversations(socket) {
  logger.debug('%s sendConversations %j', socket.id, convState.getConversations(), {});
  socket.emit('fetch-conversations-result', convState.getConversations());
}
