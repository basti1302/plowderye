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
var guestNumber = levelup(guestNumberFile);
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

// TODO This needs to be removed. Never hold all users in memory!
exports.fetchUsers = function(callback) {
  var users = {};
  usersStream().on('data', function(user) {
    users[user.id] = user;
  }).on('end', function() {
    callback(null, users);
  });
};

// TODO This needs to be removed. Never hold all user names in memory!
function userNamesStream() {
  return userNames.createReadStream()
  .pipe(through(function write(levelObject) {
    var userName = levelObject.key;
    var id = levelObject.value;
    logger.debug('read name-id pair from LevelDB: %s -> %s', userName, id);
    this.queue({ id: levelObject.value, nick: levelObject.key, });
  }));
};

// TODO This needs to be removed. Never hold all user names in memory!
exports.fetchUserNames = function(callback) {
  var _userNames = {};
  userNamesStream().on('data', function(nameIdPair) {
    logger.debug('XXX read name-id pair from LevelDB: %j', nameIdPair, {});
    _userNames[nameIdPair.nick] = nameIdPair.id;
    logger.debug('_userNames: %j', _userNames, {});
  }).on('end', function() {
    logger.debug('final _userNames: %j', _userNames, {});
    callback(null, _userNames);
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


exports.changeUserName = function(user, previousName, newName) {
  if (!user.id) {
    throw new Error('Can\'t change name without  user\'s ID.');
  }
  userNames.del(previousName);
  logger.debug('delete name: %s', previousName);
  userNames.put(newName, user.id);
  logger.debug('add name: %s -> %s', newName, user.id);
};

exports.storeGuestNumber = function(_guestNumber) {
  if (_guestNumber == null || typeof _guestNumber !== 'number' || _guestNumber < 1) {
    throw new Error('Can\'t store guest number: %d', _guestNumber);
  }
  guestNumber.put('guest-number', _guestNumber);
  logger.debug('storing guest number: %d', _guestNumber);
};

exports.fetchGuestNumber = function(callback) {
  guestNumber.get('guest-number', callback);
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
