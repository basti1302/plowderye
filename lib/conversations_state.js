'use strict';

var storage = require('./storage');

var conversations = null;
var currentConversation = {};

exports.init = function() {
  storage.getConversations(function(err, _conversations) {
    conversations = _conversations;
  });
};

function hasLoaded() {
  return conversations !== null;
}

function getConversationByName(name) {
  if (!hasLoaded()) {
    return null;
  }
  return conversations[name];
}

exports.getConversations = function() {
  return conversations;
};

exports.getConversationBySocket = function(socket) {
  return getConversationBySocketId(socket.id);
};

function getConversationBySocketId(socketId) {
  return currentConversation[socketId];
};

exports.setConversationBySocket = function(socket, name) {
  currentConversation[socket.id] = name;
};


exports.ensureExists = function(name) {
  if (hasLoaded() && !getConversationByName(name)) {
    create(name);
    return true;
  }
  return false;
};

function create(name) {
  var conversation = { id: name };
  conversations[name] = conversation;
  storage.storeConversation(conversation);
}
