'use strict';

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
