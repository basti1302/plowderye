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

exports.onNewConnection = function(id, socket, conversation) {
  conversation = findInitialConversation(id, socket, conversation);
  if (!conversation) {
    return null;
  }
  addUserToConversation(id, socket, { id: conversation.id });
  handleCreateConversation(id, socket);
  handleJoinConversation(id, socket);
  handleFetchConversations(id, socket);
  sendConversations(id, socket);
  return conversation;
};

function findInitialConversation(id, socket, conversation) {
  logger.debug('%s Trying initial conversation %j.', id, conversation, {});
  if (conversation != null && conversation.id != null) {
    if (convState.getConversationById(conversation.id)) {
      logger.debug('%s Using stored initial conversation: %s.', id, conversation.id);
      return conversation;
    } else {
      logger.debug('%s Stored conversation does not exist: %j', id, conversation, {});
    }
  } else {
    logger.debug('%s No stored conversation or no id: %j', id, conversation, {});
  }

  logger.debug('%s Can\'t use stored conversation, will use default conversation.', id);
  conversation = convState.getDefaultConversation();
  if (conversation) {
    return conversation;
  } else {
    // Can't acquire valid initial conversation, giving up. Client will be
    // disconnected immediately.
    return null;
  }
}

function createConversation(id, socket, _conversation) {
  if (_conversation.name) {
    var conversation = convState.create(_conversation.name);
    io.sockets.emit('conversation-added', conversation);
    addUserToConversation(id, socket, conversation);
  } else {
    logger.warn('%s Client provided no conversation name when trying to create a new conversation. Ignoring create request. %j', id, _conversation, {});
  }
}

function joinConversation(id, socket, _conversation) {
  logger.debug('%s joining conversation %j', id, _conversation, {});
  // check if conversation has an id and a conversation with this id exists
  var conversation = null;
  if (_conversation.id) {
    conversation = convState.getConversationById(_conversation.id);
  } else if (!_conversation.id && _conversation.name) {
    conversation = convState.getConversationByNameCaseInsensitive(_conversation.name);
  }

  if (conversation == null) {
    logger.warn('%s Can\'t find matching conversation for conversation id %s or conversation name %s. Ignoring join request.', id, _conversation.id, _conversation.name);
    return;
  }

  addUserToConversation(id, socket, conversation);
}

function addUserToConversation(id, socket, conversation) {
  var user = usersState.getUserById(id);
  user.conversationId = conversation.id;
  storage.storeUser(user);

  socket.join(conversation.id);
  convState.setConversationBySocket(socket, conversation);
  socket.emit('join-result', { conversation: conversation });

  // TODO Get rid of this broadcast and let client render information in chat
  // log triggered by 'user-joined' event.
  messageUtil.broadcast(socket, conversation, 'message',
    messageUtil.createSystemMessage(
      user.nick + ' has joined ' + conversation.name + '.'
  ));
  // TODO Maybe send only id and nick of users
  messageUtil.broadcast(socket, conversation, 'user-joined', user);

  // send all old messages - for now. TODO: Only send a few old messages and let
  // client ask for even older ones.
  storage.messagesStream(conversation).on('data', function(message) {
    socket.emit('message', message);
  });

  // TODO Currently, this call is the only reason 'conversations.js' requires
  // users.js directly. I'd like to get rid of that. We should probably use more
  // eventing instead of function calls or whatnot.
  users.sendUsersInConversation(id, socket);
}

function handleCreateConversation(id, socket) {
  socket.on('create-conversation', function(conversation) {
    if (conversation) {
      leaveConversation(id, socket, convState.getConversationBySocket(socket));
      logger.debug('%s create %j', id, conversation, {});
      createConversation(id, socket, conversation);
    }
  });
}

function handleJoinConversation(id, socket) {
  socket.on('join-conversation', function(conversation) {
    if (conversation) {
      leaveConversation(id, socket, convState.getConversationBySocket(socket));
      logger.debug('%s joins %j', id, conversation, {});
      joinConversation(id, socket, conversation);
    }
  });
}

function leaveConversation(id, socket, conversation) {
  if (conversation) {
    logger.debug('%s leaves %j', id, conversation, {});
    messageUtil.broadcast(socket, conversation, 'user-left', id);
    socket.leave(conversation.id);
    convState.removeConversationBySocket(socket);
  }
}

function handleFetchConversations(id, socket) {
  socket.on('fetch-conversations', function() {
    sendConversations(id, socket);
 });
}

function sendConversations(id, socket) {
  logger.debug('%s sendConversations %j', id, convState.getConversations(), {});
  socket.emit('fetch-conversations-result', convState.getConversations());
}
