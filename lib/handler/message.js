'use strict';

var logger = require('../logger');
var messageUtil = require('../message_util');
var storage = require('../storage');

module.exports = function(request, message) {
  logger.debug('%s broadcasting message: %j', request.id, message, {});
  pimpMessage(request, message);
  request.socket.broadcast.to(message.conversation).emit('message', message);
  storage.storeMessage(message);
};


function pimpMessage(request, message) {
  // TODO Don't attach complete user object, only id and current nick
  message.sender = request.user;
  messageUtil.addIdAndTime(message);
  return message;
}
