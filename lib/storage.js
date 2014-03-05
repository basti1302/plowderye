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
var rooms = levelup(roomsFile, {
  valueEncoding: 'json'
});

exports.storeMessage = function(message) {
  if (!message.room) {
    throw new Error('Can\'t store message without room ID.');
  }
  messages.put(message.id, message);
}

exports.getMessagesStream = function(room) {
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

exports.storeRoom = function(room) {
  if (!room.id) {
    throw new Error('Can\'t store room without ID.');
  }
  rooms.put(room.id, room);
}

exports.getRoomsStream = function() {
 return rooms.createReadStream({
      valueEncoding: 'json'
  })
  .pipe(through(function write(levelObject) {
    var room = levelObject.value;
    room.id = levelObject.key;
    this.queue(room);
  }));
}

exports.getRooms = function(callback) {
  var rooms = {};
  module.exports.getRoomsStream().on('data', function(room) {
    rooms[room.id] = room;
  }).on('end', function() {
    callback(null, rooms);
  });
}
