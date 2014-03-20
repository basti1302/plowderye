'use strict';

var logger = require('./logger');
var storage = require('./storage');
var uuid = require('node-uuid');

var conversations = null;
var conversationsBySocket = {};

// TODO Make this configurable
exports.defaultConversationName = 'Lobby';

exports.init = function() {
  logger.debug('conversations state init');
  storage.fetchConversations(function(err, _conversations) {
    if (err) {
      logger.error('Error during initial load of conversations.', err);
      console.error(err);
      process.exit(1);
    }
    conversations = _conversations;

    // create Lobby if it does not exist
    if (!getConversationByName(module.exports.defaultConversationName)) {
      module.exports.create(module.exports.defaultConversationName);
    }
    logger.debug('initial conversations: %j', conversations, {});
  });
};

function hasLoaded() {
  return conversations !== null;
}

exports.hasLoaded = hasLoaded;

exports.getConversations = function() {
  logger.debug('getConversations(): %j', conversations, {});
  return conversations;
};

exports.getConversationById = function(id) {
  logger.debug('getConversationById(%s)', id);
  if (!hasLoaded()) {
    logger.warn('accessing conversations before fully loaded.');
    return null;
  }
  logger.debug('getConversationById(%s): %j', id, conversations[id], {});
  return conversations[id];
}

/* Returns the Lobby conversation */
exports.getDefaultConversation = function() {
  // TODO If anybody ever creates another conversation with name 'Lobby', this
  // code will not be able to distinguish them.
  return getConversationByName(module.exports.defaultConversationName);
};

// conversation names are not unique, so use with care
exports.getConversationByName = getConversationByName;
function getConversationByName(name) {
  logger.debug('getConversationByName(%s)', name);
  return getConversationByNameWithCompare(name, compare);
}

// conversation names are not unique, so use with care
exports.getConversationByNameCaseInsensitive = getConversationByNameCaseInsensitive;
function getConversationByNameCaseInsensitive(name) {
  logger.debug('getConversationByNameCaseInsensitive(%s)', name);
  return getConversationByNameWithCompare(name, compareCaseInsensitive);
}

function getConversationByNameWithCompare(name, compare) {
  if (!hasLoaded()) {
    logger.warn('accessing conversations before fully loaded.');
    return null;
  }
  for (var c in conversations) {
    if (compare(conversations[c].name, name)) {
      logger.debug('getConversationByNameWithCompare(%s): %j', name, conversations[c], {});
      return conversations[c];
    }
  }
  logger.debug('getConversationByNameWithCompare(%s): not found', name);
  return null;
};

function compare(s1, s2) {
  return s1 === s2;
}

function compareCaseInsensitive(s1, s2) {
  return s1.toUpperCase() === s2.toUpperCase();
}

exports.getConversationBySocket = function(socket) {
  return getConversationBySocketId(socket.id);
};

function getConversationBySocketId(socketId) {
  logger.debug('getConversationBySocketId(%s): %j', socketId, conversationsBySocket[socketId], {});
  return conversationsBySocket[socketId];
};

exports.setConversationBySocket = function(socket, conversation) {
  logger.debug('setConversationBySocket(%s, %j)', socket.id, conversation, {});
  conversationsBySocket[socket.id] = conversation;
};

exports.removeConversationBySocket = function(socket) {
  logger.debug('removeConversationBySocket(%s)', socket.id);
  delete conversationsBySocket[socket.id];
};

exports.create = function(name) {
  logger.debug('create conversation %s', name);
  if (!hasLoaded()) {
    logger.warn('not creating conversation before fully loaded.');
    return null;
  }
  var conversation = {
    id: uuid.v4(),
    name: name,
  };
  conversations[conversation.id] = conversation;
  logger.debug('created conversation %j', conversation, {});
  storage.storeConversation(conversation);
  return conversation;
}
