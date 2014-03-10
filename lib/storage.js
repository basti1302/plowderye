'use strict';

var levelup = require('level');
var through = require('through');

// TODO Make db files location configurable
var dataDir = './data/';
var messagesFile = dataDir + 'messages';
var conversationsFile = dataDir + 'conversations';

var messages = levelup(messagesFile, {
  valueEncoding: 'json'
});
var conversations = levelup(conversationsFile, {
  valueEncoding: 'json'
});

exports.storeMessage = function(message) {
  if (!message.conversation) {
    throw new Error('Can\'t store message without conversation ID.');
  }
  messages.put(message.id, message);
}

exports.getMessagesStream = function(conversation) {
 return messages.createReadStream({
      valueEncoding: 'json'
  })
  // only deliver messages for the given conversation
  .pipe(through(function write(levelObject) {
    var message = levelObject.value;
    if (message && message.conversation && message.conversation === conversation) {
      this.queue(message);
    }
  }));
}

exports.storeConversation = function(conversation) {
  if (!conversation.id) {
    throw new Error('Can\'t store conversation without ID.');
  }
  conversations.put(conversation.id, conversation);
}

exports.getConversationsStream = function() {
 return conversations.createReadStream({
      valueEncoding: 'json'
  })
  .pipe(through(function write(levelObject) {
    var conversation = levelObject.value;
    conversation.id = levelObject.key;
    this.queue(conversation);
  }));
}

exports.getConversations = function(callback) {
  var conversations = {};
  module.exports.getConversationsStream().on('data', function(conversation) {
    conversations[conversation.id] = conversation;
  }).on('end', function() {
    callback(null, conversations);
  });
}
