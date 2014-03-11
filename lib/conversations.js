'use strict';

var convState = require('./conversations_state');
var messageUtil = require('./message_util');
var storage = require('./storage');
var usersState = require('./users_state');

exports.onNewConnection = function(socket, conversationName) {
  joinConversation(socket, conversationName);
  handleConversationJoining(socket);
  handleFetchConversations(socket);
  sendConversations(socket);
};

function joinConversation(socket, conversationName) {
  convState.ensureExists(conversationName);
  socket.join(conversationName);
  convState.setConversationBySocket(socket, conversationName);
  socket.emit('join-result', { conversation: conversationName });

  socket.broadcast.to(conversationName).emit('message',
    messageUtil.createSystemMessage(
      usersState.getUserBySocket(socket) + ' has joined ' + conversationName + '.'
  ));

  // send all old messages
  storage.getMessagesStream(conversationName).on('data', function(message) {
    socket.emit('message', message);
  });
}

function handleConversationJoining(socket) {
  socket.on('join', function(conversation) {
    socket.leave(convState.getConversationBySocket(socket));
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
  for (var conversationId in convState.getConversations()) {
    conversationNames.push(conversationId);
  }
  socket.emit('fetch-conversations-result', conversationNames);
}
