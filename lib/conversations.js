'use strict';

var messageUtil = require('./message_util');
var storage = require('./storage');

var conversations = null;
var currentConversation = {};

exports.readConversations = function() {
  storage.getConversations(function(err, _conversations) {
    conversations = _conversations;
  });
};

exports.onNewConnection = function(socket, conversationName) {
  joinConversation(socket, conversationName);
  handleConversationJoining(socket);
  handleFetchConversations(socket);
  sendConversations(socket);
};

exports.getConversationBySocket = function(socket) {
  return module.exports.getConversationBySocketId(socket.id);
};

exports.getConversationBySocketId = function(socketId) {
  return currentConversation[socketId];
};

function joinConversation(socket, conversationName) {
  if (conversations && !conversations[conversationName]) {
    var newConversation = { id: conversationName };
    conversations[conversationName] = newConversation;
    storage.storeConversation(newConversation);
  }
  socket.join(conversationName);
  currentConversation[socket.id] = conversationName;
  socket.emit('join-result', { conversation: conversationName });
  /*
  TODO Temporarily disabled to avoid cyclic dependency between conversations
  and users

  socket.broadcast.to(conversationName).emit('message',
    messageUtil.createSystemMessage(
      users.getUserBySocket(socket) + ' has joined ' + conversationName + '.'
  ));
  */

  // send all old messages
  storage.getMessagesStream(conversationName).on('data', function(message) {
    socket.emit('message', message);
  });
}

function handleConversationJoining(socket) {
  socket.on('join', function(conversation) {
    socket.leave(currentConversation[socket.id]);
    joinConversation(socket, conversation.newConversation);
  });
}

function handleFetchConversations(socket) {
  socket.on('fetch-conversations', function() {
    sendConversations(socket);
 });
}

function sendConversations(socket) {
  var conversationNames = [];
  for (var conversationId in conversations) {
    conversationNames.push(conversationId);
  }
  socket.emit('fetch-conversations-result', conversationNames);
}
