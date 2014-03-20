'use strict';

var logger = require('./logger');
var messageUtil = require('./message_util');
var storage = require('./storage');
var usersState = require('./users_state');

exports.onNewConnection = function(id, socket) {
  handleMessageBroadcasting(id, socket);
};

function handleMessageBroadcasting(id, socket) {
  socket.on('message', function (message) {
    logger.debug('%s broadcasting message: %j', id, message, {});
    pimpMessage(id, message);
    socket.broadcast.to(message.conversation).emit('message', message);
    storage.storeMessage(message);
  });
}

function pimpMessage(id, message) {
  // TODO Don't attach complete user object, only id and current nick
  message.sender = usersState.getUserById(id);
  messageUtil.addIdAndTime(message);
  return message;
}
