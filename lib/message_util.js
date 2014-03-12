'use strict';

var logger = require('./logger');

exports.createSystemMessage = function(text) {
  var message = {
    sender: '::',
    text: text,
    system: true,
  }
  module.exports.addIdAndTime(message);
  return message;
};

exports.addIdAndTime = function(message) {
  message.serverTime = Date.now();
  message.id = message.serverTime + '-' + randomString();
  return message;
};

function randomString()  {
  return ('' + Math.random()).substr(2, 4);
}

exports.broadcast = function(socket, conversation, eventType, payload) {
  logger.debug('broadcasting: %s -> %s: %s: %j',
    socket.id, conversation.id, eventType, payload, {});
  socket
    .broadcast
    .to(conversation.id)
    .emit(eventType, payload);
}
