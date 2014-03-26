'use strict';

// TODO Split in smaller things by responsibility
// - initial conversation handling (onNewConnection and friends)
// - createConversation
// - joinConversation
// - sendConversations

var uuid = require('node-uuid');

var logger = require('./logger');
var messageUtil = require('./message_util');
var storage = require('./storage');
var usersInConversation = require('./users_in_conversation');

var io;

// TODO Make this configurable
var defaultConversationName = 'Lobby';
exports.defaultConversationName = defaultConversationName;

exports.setIo = function(_io) {
  io = _io;
};

exports.init = function(callback) {
  // create Lobby if it does not exist
  storage.doesConversationExist(defaultConversationName, function(err, exists) {
    if (err || !exists) {
      logger.info('creating default conversation.');
      create(defaultConversationName);
    }
    callback(null);
  });
};

exports.onNewConnection = function(request, conversationId, callback) {
  findInitialConversation(request, conversationId, function(err, conversation) {
    if (err) { return callback(err); }
    if (!conversation) {
      return callback(null, null);
    }
    addUserToConversation(request, conversation);
    sendConversations(request);
    return callback(null, conversation);
  });
};

function findInitialConversation(request, conversationId, callback) {
  logger.debug('%s Trying initial conversation %s.', request.id, conversationId);
  if (conversationId == null) {
    logger.debug('%s No stored conversation id.', request.id);
    return storage.findConversationByName(defaultConversationName, callback);
  }

  storage.fetchConversation(conversationId, function(err, conversation) {
    if (err) { return callback(err); }
    if (conversation) {
      logger.debug('%s Using stored initial conversation: %s.', request.id, conversation.id);
      return callback(null, conversation);
    } else {
      logger.debug('%s Stored conversation does not exist: %s', request.id, conversationId);
      return storage.findConversationByName(defaultConversationName, callback);
    }
  });
}

exports.createConversation = createConversation;
function createConversation(request, _conversation) {
  if (_conversation.name) {
    var conversation = create(_conversation.name);
    io.sockets.emit('conversation-added', conversation);
    addUserToConversation(request, conversation);
  } else {
    logger.warn('%s Client provided no conversation name when trying to create a new conversation. Ignoring create request. %j', request.id, _conversation, {});
  }
}

function create(name) {
  var conversation = {
    id: uuid.v4(),
    name: name,
  };
  logger.debug('created conversation %j', conversation, {});
  storage.storeConversation(conversation);
  return conversation;
}

exports.joinConversation = function(request, _conversation) {
  logger.debug('%s joining conversation %j', request.id, _conversation, {});
  if (_conversation.id) {
    storage.fetchConversation(_conversation.id, function(err, conversation) {
      if (err) { return logger.error(err); }
      addUserToConversationIfFound(request, conversation);
    });
  } else if (_conversation.name) {
    storage.findConversationByNameCaseInsensitive(_conversation.id, function(err, conversation) {
      if (err) { return logger.error(err); }
      if (conversation) {
        addUserToConversationIfFound(request, conversation);
      }
    });
  }
}

function addUserToConversationIfFound(request, conversation) {
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

  usersInConversation.send(request);
}

exports.leaveCurrentConversation = leaveCurrentConversation;
function leaveCurrentConversation(request) {
  storage.fetchConversation(request.user.conversationId, function(err, conversation) {
    if (err) { return logger.error(err); }
    logger.debug('%s (%s) leaves %j', request.id, request.user.nick, conversation, {});
    messageUtil.broadcast(request.socket, conversation, 'user-left', request.id);
    request.socket.leave(conversation.id);
  });
}

function sendConversations(request) {
  storage.fetchConversationsForUser(request.user, function(err, conversations) {
    if (err) { return logger.error(err); }
    logger.debug('%s sendConversations %j', request.id, conversations, {});
    request.socket.emit('fetch-conversations-result', conversations);
  });
}
