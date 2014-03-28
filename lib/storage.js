'use strict';

var levelup = require('level')
  , nconf   = require('nconf')
  , path    = require('path')
  , through = require('through')
  ;

var logger = require('./logger');

var dataDir = nconf.get('data');
logger.info('data directory: %s', dataDir);

var conversationsFile = path.join(dataDir, 'conversations');
logger.debug('conversations: %s', conversationsFile);
var conversationNamesFile = path.join(dataDir, 'conversation_names');
logger.debug('conversation names: %s', conversationNamesFile);
var messagesFile = path.join(dataDir, 'messages');
logger.debug('messages: %s', messagesFile);
var usersFile = path.join(dataDir, 'users');
logger.debug('users: %s', usersFile);
var userNamesFile = path.join(dataDir, 'user_names');
logger.debug('user names: %s', userNamesFile);

var conversations = levelup(conversationsFile, {
  valueEncoding: 'json'
});
var conversationNames = levelup(conversationNamesFile);
var messages = levelup(messagesFile, {
  valueEncoding: 'json'
});
var users = levelup(usersFile, {
  valueEncoding: 'json'
});
var userNames = levelup(userNamesFile);

exports.storeConversation = function(conversation) {
  if (!conversation.id) {
    throw new Error('Can\'t store conversation without ID.');
  }
  logger.debug('storing conversation %s: %j', conversation.id, conversation, {});
  conversations.put(conversation.id, conversation);
  storeConversationName(conversation);
};

exports.fetchConversation = fetchConversation;
function fetchConversation(id, callback) {
  if (!id) {
    throw new Error('Can\'t fetch conversation without ID.');
  }
  conversations.get(id, callback);
};

exports.conversationsStream = conversationsStream;
function conversationsStream() {
  logger.debug('reading conversations from LevelDB');
  return conversations.createReadStream({
      valueEncoding: 'json'
  })
  .pipe(through(function write(levelObject) {
    var conversation = levelObject.value;
    logger.silly('read conversation from LevelDB: %j', conversation, {});
    this.queue(conversation);
  }));
};

exports.fetchConversationsForUser = function(user, callback) {
  var conversations = {};
  conversationsStream().on('data', function(conversation) {
    // right now: push all conversations.
    // later: only push conversations the user participates in
    conversations[conversation.id] = conversation;
  }).on('end', function() {
    callback(null, conversations);
  });
};

exports.storeConversationName = storeConversationName;
function storeConversationName(conversation) {
  if (!conversation.id) {
    throw new Error('Can\'t store conversation name without conversation\'s ID.');
  }
  if (!conversation.name) {
    throw new Error('Can\'t store conversation name without name.');
  }
  conversationNames.put(conversation.name, conversation.id);
  logger.debug('add conversation name: %s -> %s', conversation.name, conversation.id);
};

exports.fetchConversationIdByName = fetchConversationIdByName;
function fetchConversationIdByName(name, callback) {
  conversationNames.get(name, callback);
}

exports.doesConversationExist = function(name, callback) {
  fetchConversationIdByName(name, function(err, id) {
    if (err && err.notFound) {
      callback(null, false);
    } else if (err) {
      callback(err, false);
    } else {
      callback(null, true, id);
    }
  });
};

function conversationNamesStream(start, end) {
  logger.debug('reading conversation names from LevelDB');
  return conversationNames
  .createReadStream(start, end)
  .pipe(through(function write(levelObject) {
    var nameIdPair = { name: levelObject.key, id: levelObject.value, };
    logger.silly('read conversation name from LevelDB: %j', nameIdPair, {});
    this.queue(nameIdPair);
  }));
};

// conversation names are not unique, so use with care
exports.findConversationByName = function(name, callback) {
  findConversationByName(name, compareCaseSensitive, callback);
}

// conversation names are not unique, so use with care
exports.findConversationByNameCaseInsensitive = function(name, callback) {
  findConversationByName(name, compareCaseInsensitive, callback);
}

function findConversationByName(name, compare, callback) {
  // Cut of last character because start key for levelup createReadStream is
  // exclusive
  var start = name.toLowerCase().slice(0, -1);
  var end = name.toUpperCase();

  var found = false;
  conversationNamesStream(start, end).on('data', function(nameIdPair) {
    if (!found && compare(name, nameIdPair.name)) {
      found = true;
      var id = nameIdPair.id;
      logger.debug('findConversationByName(%s): %s', name, id);
      fetchConversation(id, callback);
    }
  }).on('end', function() {
    if (!found) {
      logger.debug('findConversationByName(%s): not found', name);
      callback(null, null);
    }
  });
};

function compareCaseSensitive(s1, s2) {
  return s1 === s2;
}

function compareCaseInsensitive(s1, s2) {
  return s1.toUpperCase() === s2.toUpperCase();
}

exports.storeMessage = function(message) {
  if (!message.conversation) {
    throw new Error('Can\'t store message without conversation ID.');
  }
  messages.put(message.id, message);
  logger.silly('storing message: %j', message, {});
};

exports.messagesStream = function(conversation) {
 return messages.createReadStream({
      valueEncoding: 'json'
  })
  // only deliver messages for the given conversation
  .pipe(through(function write(levelObject) {
    var message = levelObject.value;
    logger.silly('read message from LevelDB: %j', message, {});
    if (message && message.conversation && message.conversation === conversation.id) {
      this.queue(message);
    }
  }));
};

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

exports.fetchUser = function(id, callback) {
  if (!id) {
    throw new Error('Can\'t fetch user without ID.');
  }
  users.get(id, callback);
};

exports.usersStream = usersStream;
function usersStream() {
  return users.createReadStream({
      valueEncoding: 'json'
  })
  .pipe(through(function write(levelObject) {
    var user = levelObject.value;
    logger.silly('read user from LevelDB: %j', user, {});
    this.queue(user);
  }));
};

exports.fetchUsersInConversation = function(conversationId, callback) {
  // TODO It's quite ugly to iterate over *all* users only to find the users
  // that participate in a specific conversation. Store both relations in
  // LevelDB.
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
