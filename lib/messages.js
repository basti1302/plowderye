'use strict';

var messageUtil = require('./message_util');
var storage = require('./storage');
var usersState = require('./users_state');

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
  message.sender = usersState.getUserBySocket(senderSocket);
  messageUtil.addIdAndTime(message);
  return message;
}
