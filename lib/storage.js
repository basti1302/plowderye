'use strict';

var levelup = require('level');
var logger = require('./logger');
var through = require('through');

// TODO Make db files location configurable
var dataDir = './data/';

var conversationsFile = dataDir + 'conversations';
var guestNumberFile = dataDir + 'guest_number';
var messagesFile = dataDir + 'messages';
var usersFile = dataDir + 'users';
var userNamesFile = dataDir + 'user_names';

var conversations = levelup(conversationsFile, {
  valueEncoding: 'json'
});
var messages = levelup(messagesFile, {
  valueEncoding: 'json'
});
var users = levelup(usersFile, {
  valueEncoding: 'json'
});
var userNames = levelup(userNamesFile);

exports.storeUser = function(user) {
  if (!user.id) {
    throw new Error('Can\'t store user without ID.');
  }
  if (!user.nick) {
    throw new Error('Can\'t store user without name.');
  }
  logger.debug('storing user %j', user, {});
  users.put(user.id, user);
  storeUserName(user);
};

exports.usersStream = usersStream;
function usersStream() {
  return users.createReadStream({
      valueEncoding: 'json'
  })
  .pipe(through(function write(levelObject) {
    var user = levelObject.value;
    logger.debug('read user from LevelDB: %j', user, {});
    this.queue(user);
  }));
};

exports.fetchUser = function(id, callback) {
  if (!id) {
    throw new Error('Can\'t store user without ID.');
  }
  users.get(id, callback);
};

exports.fetchUsersInConversation = function(conversationId, callback) {
  var users = {};
  usersStream().on('data', function(user) {
    if (user.conversationId === conversationId) {
      users[user.id] = user;
    }
  }).on('end', function() {
    callback(null, users);
  });
};

exports.storeUserName = storeUserName;
function storeUserName(user) {
  if (!user.id) {
    throw new Error('Can\'t store user name without user\'s ID.');
  }
  if (!user.nick) {
    throw new Error('Can\'t store user name without name.');
  }
  userNames.put(user.nick, user.id);
  logger.debug('add name: %s -> %s', user.nick, user.id);
};

exports.fetchUserName = function(name, callback) {
  userNames.get(name, callback);
};

exports.changeUserName = function(user, previousName, newName) {
  if (!user.id) {
    throw new Error('Can\'t change name without  user\'s ID.');
  }
  userNames.del(previousName);
  logger.debug('delete name: %s', previousName);
  userNames.put(newName, user.id);
  logger.debug('add name: %s -> %s', newName, user.id);
};

exports.storeMessage = function(message) {
  if (!message.conversation) {
    throw new Error('Can\'t store message without conversation ID.');
  }
  messages.put(message.id, message);
  logger.debug('storing message: %j', message, {});
};

exports.messagesStream = function(conversation) {
 return messages.createReadStream({
      valueEncoding: 'json'
  })
  // only deliver messages for the given conversation
  .pipe(through(function write(levelObject) {
    var message = levelObject.value;
    logger.debug('read message from LevelDB: %j', message, {});
    if (message && message.conversation && message.conversation === conversation.id) {
      this.queue(message);
    }
  }));
};

exports.storeConversation = function(conversation) {
  if (!conversation.id) {
    throw new Error('Can\'t store conversation without ID.');
  }
  logger.debug('storing conversation %s: %j', conversation.id, conversation, {});
  conversations.put(conversation.id, conversation);
};

exports.conversationsStream = conversationsStream;
function conversationsStream() {
  logger.debug('reading conversations from LevelDB');
  return conversations.createReadStream({
      valueEncoding: 'json'
  })
  .pipe(through(function write(levelObject) {
    var conversation = levelObject.value;
    logger.debug('read conversation from LevelDB: %j', conversation, {});
    this.queue(conversation);
  }));
};

// TODO This needs to be removed. Never hold all conversations in memory!
exports.fetchConversations = function(callback) {
  var conversations = {};
  conversationsStream().on('data', function(conversation) {
    conversations[conversation.id] = conversation;
  }).on('end', function() {
    callback(null, conversations);
  });
};
