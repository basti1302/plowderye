'use strict';

var _       = require('lodash')
  , async   = require('async')
  , levelup = require('level')
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
var conversationUserListsFile = path.join(dataDir, 'conversation_user_lists');
logger.debug('conversation user lists: %s', conversationUserListsFile);

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
var conversationUserLists = levelup(conversationUserListsFile, {
  valueEncoding: 'json'
});
var messages = levelup(messagesFile, {
  valueEncoding: 'json'
});

var users = levelup(usersFile, {
  valueEncoding: 'json'
});
var userNames = levelup(userNamesFile);

exports.storeConversation = function(conversation, callback) {
  if (!conversation.id) {
    throw new Error('Can\'t store conversation without ID.');
  }
  logger.debug('storing conversation %s: %j', conversation.id, conversation, {});
  conversations.put(conversation.id, conversation, function(err) {
    if (err) {
      if (!callback) { throw err; }
      return callback(err);
    }
    storeConversationName(conversation, callback);
  });
};

exports.fetchConversation = fetchConversation;
function fetchConversation(id, callback) {
  if (!id) {
    return callback(new Error('Can\'t fetch conversation without ID.'));
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

exports.fetchPublicConversations = function(user, callback) {
  var conversations = {};
  conversationsStream()
  .pipe(through(function write(conversation) {
    if (!conversation.private) {
      this.queue(conversation);
    }
  }))
  .on('data', function(conversation) {
    conversations[conversation.id] = conversation;
  }).on('end', function() {
    callback(null, conversations);
  });
};

exports.storeConversationName = storeConversationName;
function storeConversationName(conversation, callback) {
  if (!conversation.id) {
    throw new Error('Can\'t store conversation name without conversation\'s ID.');
  }
  if (!conversation.name) {
    throw new Error('Can\'t store conversation name without name.');
  }
  conversationNames.put(conversation.name, conversation.id, callback);
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

exports.storeConversationUserList = function(conversationId, userList) {
  conversationUserLists.put(conversationId, userList);
};

exports.addToConversationUserList = function(conversationId, userId) {
  if (!conversationId) {
    throw new Error('Can\'t add to conversation user list without '
      + 'conversation ID.');
  }
  if (!userId) {
    throw new Error('Can\'t add to conversation user list without '
      + 'user ID.');
  }
  logger.debug('adding to conversation user list %s: %s', conversationId, userId);
  fetchConversationUserList(conversationId, function(err, userList) {
    if (err && err.notFound) {
      userList = {};
    } else if (err) {
      return logger.error(err);
    }
    userList[userId] = {};
    logger.debug('putting into conversation user list %s: %j', conversationId, userList, {});
    conversationUserLists.put(conversationId, userList);
  });
};

exports.removeFromConversationUserList = function(conversationId, userId) {
  if (!conversationId) {
    throw new Error('Can\'t add to conversation user list without '
      + 'conversation ID.');
  }
  if (!userId) {
    throw new Error('Can\'t add to conversation user list without '
      + 'user ID.');
  }
  logger.debug('removing %s from conversation user list for %s', userId, conversationId);
  fetchConversationUserList(conversationId, function(err, userList) {
    if (err && err.notFound) {
      logger.warn('can\'t remove %s from conversation user list for %s because list does not exist.', userId, conversationId);
      return;
    } else if (err) {
      return logger.error(err);
    }
    delete userList[userId];
    logger.debug('PUTTING INTO conversation user lists (REMOVE) %s: %j', conversationId, userList, {});
    // TODO Delete entry from LevelDB if userList is empty for given conv id
    conversationUserLists.put(conversationId, userList);
  });
};

exports.fetchConversationUserList = fetchConversationUserList;
function fetchConversationUserList(conversationId, callback) {
  logger.debug('fetchConversationUserList: %s', conversationId);
  if (!conversationId) {
    callback(new Error('Can\'t fetch conversation without ID.'));
  }
  conversationUserLists.get(conversationId, callback);
};

exports.fetchUsersInConversation = function(conversationId, callback) {
  logger.debug('fetchUsersInConversation: %s', conversationId);

  // load list of user ids for conversation
  fetchConversationUserList(conversationId, function(err, userList) {
    if (err && err.notFound) {
      return callback(null, {});
    } else if (err) {
      return callback(err);
    }

    // load user object for each user id
    var users = {};
    async.each(Object.keys(userList), function(userId, eachCallback) {
      logger.debug('fetching user object for conversation user list: %s', userId);
      fetchUser(userId, function(err, user) {
        if (err && err.notFound) {
          logger.warn('could not find user for conversation user list: %s', userId);
          return eachCallback(null);
        } else if (err) {
          return eachCallback(err);
        }
        logger.debug('fetched user for conversation user list: %j', user, {});
        users[user.id] = user;
        return eachCallback(null);
      });
    }, function(err) {
      if (err) { return callback(err); }
      return callback(null, users);
    });
  });
};

exports.storeMessage = function(message, callback) {
  if (!message.conversation) {
    throw new Error('Can\'t store message without conversation ID.');
  }
  messages.put(message.id, message, callback);
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

exports.storeUser = function(user, callback) {
  if (!user.id) {
    throw new Error('Can\'t store user without ID.');
  }
  if (!user.nick) {
    throw new Error('Can\'t store user without name.');
  }
  logger.debug('storing user %j', user, {});
  users.put(user.id, user, function(err) {
    if (err) {
      if (!callback) { throw err; }
      return callback(err);
    }
    storeUserName(user, callback);
  });
};

exports.fetchUser = fetchUser;
function fetchUser(id, callback) {
  if (!id) {
    return callback(new Error('Can\'t fetch user without ID.'));
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

// TODO We should not store all users in memory. It's only used to send a list
// of all users to the client - which is a feature that should also not exist.
// This should be replaced with some sort of managing contacts for users and
// having a list of contacts for each user, which will be send to the client
// instead of a list of all users.
exports.fetchAllUsers = function(callback) {
  var users = {};
  usersStream().on('data', function(user) {
    users[user.id] = user;
  }).on('end', function() {
    callback(null, users);
  });
};


exports.storeUserName = storeUserName;
function storeUserName(user, callback) {
  if (!user.id) {
    throw new Error('Can\'t store user name without user\'s ID.');
  }
  if (!user.nick) {
    throw new Error('Can\'t store user name without name.');
  }
  userNames.put(user.nick, user.id, callback);
  logger.debug('add name: %s -> %s', user.nick, user.id);
};

exports.fetchUserName = fetchUserName;
function fetchUserName(name, callback) {
  userNames.get(name, callback);
}

exports.fetchUserByName = function(name, callback) {
  fetchUserName(name, function(err, userId) {
    if (err) { return callback(err); }
    fetchUser(userId, callback);
  });
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
