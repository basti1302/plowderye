'use strict';

var logger = require('./logger');
var storage = require('./storage');
var uuid = require('node-uuid');

// *ALL* users, even users who are currently not online
var users = {};
// *ALL* used names, even from users who are currently not online
var userIdsByName = {};
// users that are currently online
// var usersBySocket = {};

var guestNumber = 1;

exports.init = function() {
  logger.debug('users state init');
  storage.fetchUsers(function(err, _users) {
    if (err) {
      logger.error('Error during initial load of users.', err);
      console.error(err);
      process.exit(1);
    }
    users = _users;
    logger.debug('initial users: %j', users, {});
  });
  storage.fetchUserNames(function(err, _userIdsByName) {
    logger.debug('_userIdsByName: %j', _userIdsByName, {});
    if (err) {
      logger.error('Error during initial load of user names.', err);
      console.error(err);
      process.exit(1);
    }
    userIdsByName = _userIdsByName;
    logger.debug('initial user names: %j', userIdsByName, {});
  });
  storage.fetchGuestNumber(function(err, _guestNumber) {
    if (err && err.notFound) {
      guestNumber = 1;
      storage.storeGuestNumber(guestNumber);
    } else if (err && !err.notFound) {
      logger.error('Error during initial load of guest number.', err);
      console.error(err);
      process.exit(1);
    } else {
      guestNumber = _guestNumber;
    }
    logger.debug('initial guest number: %d', guestNumber, {});
  });
};

exports.initUser = function(idFromCookie, callback) {
  if (!idFromCookie) {
    process.nextTick(function() {
      initializeUserObject(null, callback);
    });
  } else {
    storage.fetchUser(idFromCookie, function(err, user) {
      if (err) {
        if (err.notFound) {
          logger.warn('could not find user by id from cookie: %s', idFromCookie);
       } else {
          logger.error('could not find user by id from cookie (%s) due to unexpected error: %j', idFromCookie, err, {});
        }
      }
      initializeUserObject(user, callback);
    });
  }
}

function initializeUserObject(user, callback) {
  if (!user) {
    user = {
      id: uuid.v4(),
      conversationId: null,
      soundEnabled: true,
      notificationsEnabled: false,
    };
    assignGuestNick(user);
    logger.debug('%s created new user object: %j', user.id, user, {});
  }

  if (!user.nick) {
    logger.warn('%s user from db had no nick name.', user.id);
    assignGuestNick(user);
  }
  // TODO This is stupid. A registered name of a stored user should not have
  // been taken by someone else. And it should also never be Guest... unless
  // we store guest users, in which case the user should be guest next time
  // he comes online. So we only need to do this checks on name change
  // attempts, but then we need to check all user records.
  //
  // We probably should have a separate leveldb of used names
  else if (!isAvailable(user.nick) && userIdsByName[user.nick] !== user.id) {
    logger.warn('%s nick name from db (%s) is not available?!', user.id, user.nick);
    assignGuestNick(user);
  }

  logger.debug('%s init user %j', user.id, user, {});
  setUserById(user);
  storage.storeUser(user);
  userIdsByName[user.nick] = user.id;

  callback(user);
}

function assignGuestNick(user) {
  user.nick = 'Guest' + guestNumber;
  guestNumber++;
  storage.storeGuestNumber(guestNumber);
  logger.debug('%s assigned guest nick name: %s', user.id, user.nick);
}

exports.getUsers = function() {
  return users;
};

exports.getUserById = getUserById;
function getUserById(id) {
  return users[id];
};

function setUserById(user) {
  users[user.id] = user;
};

exports.isAllowed = isAllowed;
function isAllowed(name) {
  return name.indexOf('Guest') != 0;
};

exports.isAvailable = isAvailable;
function isAvailable(name) {
  return typeof userIdsByName[name] === 'undefined';
};

exports.rename = function(id, name) {
  logger.debug('%s rename(%s)', id, name);
  var user = getUserById(id);
  if (user) {
    var previousName = user.nick;
    delete userIdsByName[previousName];
    userIdsByName[name] = id;
    storage.changeUserName(user, previousName, name)
    user.nick = name;
    storage.storeUser(user);
    logger.debug('%s renamed from %s to %s', id, previousName, user.nick);
  } else {
    logger.warn('%s rename - unknown user', id);
  }
};

exports.setSoundEnabled = function(id, enabled) {
  logger.debug('%s enable sound: %s', id, enabled);
  var user = getUserById(id);
  user.soundEnabled = enabled;
  storage.storeUser(user);
};

exports.setNotificationsEnabled = function(id, enabled) {
  logger.debug('%s enable notifications: %s', id, enabled);
  var user = getUserById(id);
  user.notificationsEnabled = enabled;
  storage.storeUser(user);
};

exports.onUserDisconnect = function(id) {
  logger.debug('%s onUserDisconnect', id);
  var user = getUserById(id);
  if (user) {
    logger.debug('%s (%s) disconnects.', id, user.nick);
    delete users[id];
  } else {
    logger.warn('%s onUserDisconnect - unknown user', id);
  }
};
