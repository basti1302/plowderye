'use strict';

var messageUtil = require('./message_util');
var storage = require('./storage');
var users = require('./users');

exports.onNewConnection = function(socket) {
  handleMessageBroadcasting(socket);
};

function handleMessageBroadcasting(socket) {
  socket.on('message', function (message) {
    pimpMessage(message, socket);
    socket.broadcast.to(message.conversation).emit('message', message);
    storage.storeMessage(message);
  });
}

function pimpMessage(message, senderSocket) {
  message.sender = users.getUserBySocket(senderSocket);
  messageUtil.addIdAndTime(message);
  return message;
}
