'use strict';

var io;

var convState = require('./conversations_state');
var logger = require('./logger');
var messageUtil = require('./message_util');
var storage = require('./storage');
var conversationUserList = require('./conversation_user_list');

exports.setIo = function(_io) {
  io = _io;
};

exports.onNewConnection = function(request, conversationId) {
  var conversation = findInitialConversation(request, conversationId);
  if (!conversation) {
    return null;
  }
  addUserToConversation(request, conversation);
  sendConversations(request);
  return conversation;
};

function findInitialConversation(request, conversationId) {
  logger.debug('%s Trying initial conversation %s.', request.id, conversationId);
  if (conversationId != null) {
    var conversation = convState.getConversationById(conversationId);
    if (conversation) {
      logger.debug('%s Using stored initial conversation: %s.', request.id, conversation.id);
      return conversation;
    } else {
      logger.debug('%s Stored conversation does not exist: %s', request.id, conversationId);
    }
  } else {
    logger.debug('%s No stored conversation id.', request.id);
  }

  logger.debug('%s Can\'t use stored conversation, will use default conversation.', request.id);
  conversation = convState.getDefaultConversation();
  if (conversation) {
    return conversation;
  } else {
    // Can't acquire valid initial conversation, giving up. Client will be
    // disconnected immediately.
    return null;
  }
}

exports.createConversation = createConversation;
function createConversation(request, _conversation) {
  if (_conversation.name) {
    var conversation = convState.create(_conversation.name);
    io.sockets.emit('conversation-added', conversation);
    addUserToConversation(request, conversation);
  } else {
    logger.warn('%s Client provided no conversation name when trying to create a new conversation. Ignoring create request. %j', request.id, _conversation, {});
  }
}

exports.joinConversation = joinConversation;
function joinConversation(request, _conversation) {
  logger.debug('%s joining conversation %j', request.id, _conversation, {});
  // check if conversation has an id and a conversation with this id exists
  var conversation = null;
  if (_conversation.id) {
    conversation = convState.getConversationById(_conversation.id);
  } else if (!_conversation.id && _conversation.name) {
    conversation = convState.getConversationByNameCaseInsensitive(_conversation.name);
  }

  if (conversation == null) {
    logger.warn('%s Can\'t find matching conversation for conversation id %s or conversation name %s. Ignoring join request.', request.id, _conversation.id, _conversation.name);
    return;
  }

  addUserToConversation(request, conversation);
}

function addUserToConversation(request, conversation) {
  logger.debug('%s addUserToConversation: %j', request.id, conversation, {});
  request.user.conversationId = conversation.id;
  storage.storeUser(request.user);

  request.socket.join(conversation.id);
  convState.setConversationBySocket(request.socket, conversation);
  request.socket.emit('join-result', { conversation: conversation });

  // TODO Get rid of this broadcast and let client render information in chat
  // log triggered by 'user-joined' event.
  messageUtil.broadcast(request.socket, conversation, 'message',
    messageUtil.createSystemMessage(
      request.user.nick + ' has joined ' + conversation.name + '.'
  ));
  // TODO Maybe send only id and nick of users
  messageUtil.broadcast(request.socket, conversation, 'user-joined', request.user);

  // send all old messages - for now. TODO: Only send a few old messages and let
  // client ask for even older ones.
  storage.messagesStream(conversation).on('data', function(message) {
    request.socket.emit('message', message);
  });

  conversationUserList.sendUsersInConversation(request);
}

exports.leaveCurrentConversation = leaveCurrentConversation;
function leaveCurrentConversation(request) {
  var conversation = convState.getConversationBySocket(request.socket)
  if (conversation) {
    logger.debug('%s (%s) leaves %j', request.id, request.user.nick, conversation, {});
    messageUtil.broadcast(request.socket, conversation, 'user-left', request.id);
    request.socket.leave(conversation.id);
    convState.removeConversationBySocket(request.socket);
  }
}

function sendConversations(request) {
  logger.debug('%s sendConversations %j', request.id, convState.getConversations(), {});
  request.socket.emit('fetch-conversations-result', convState.getConversations());
}
