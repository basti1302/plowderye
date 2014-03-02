'use strict';

var levelup = require('level');
var through = require('through');

// TODO Make db files location configurable
var dataDir = './data/';
var messagesFile = dataDir + 'messages';
var roomsFile = dataDir + 'rooms';

var messages = levelup(messagesFile, {
  valueEncoding: 'json'
});
var rooms = levelup(roomsFile);

exports.storeMessage = function(message) {
  if (!message.room) {
    throw new Error('Can\'t store message without room ID.');
  }
  messages.put(message.id, message);
}

exports.storeRoom = function(room) {
  if (typeof room != 'string') {
    throw new Error('Can\'t store room name: ' + room);
  }
  rooms.put(room, room);
}

exports.getMessagesStream = function(room) {
 console.log('reading messages');
 return messages.createReadStream({
      valueEncoding: 'json'
  })
  // only deliver messages for the given room
  .pipe(through(function write(levelObject) {
    var message = levelObject.value;
    if (message && message.room && message.room === room) {
      this.queue(message);
    }
  }));
}

function encodeBase64(name) {
  return new Buffer(name).toString('base64');
}

function decodeBase64(name) {
  return new Buffer(name, 'base64').toString('utf8');
}
