'use strict';

var cookieParser  = require('cookie')
  , genId         = require('gen-id')('nnnn')
  , uuid          = require('node-uuid')
  ;

var logger        = require('./logger')
  , nameAvailable = require('./name_available')
  , storage       = require('./storage')
  ;

exports.onNewConnection = function(socket, callback) {
  setUpUser(socket, function(user) {
    storage.storeUser(user);
    logger.debug('%s initialized user: %j', user.id, user, {});
    socket.emit('init-user-result', user);
    callback(null, user);
  });
};

function setUpUser(socket, callback) {
  var idFromCookie = readCookie(socket);
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

function readCookie(socket) {
  var cookieString = socket.handshake.headers['cookie'];
  if (!cookieString) {
    return null;
  }
  var cookie = cookieParser.parse(cookieString);
  logger.debug('read cookie for socket %s: %j', socket.id, cookie, {});
  if (!cookie) {
    return null;
  }
  return cookie.id;
}

function initializeUserObject(user, callback) {
  if (!user) {
    user = createUserObject();
  }
  user.online = true;

  if (!user.nick) {
    initUserWithoutNick(user, callback);
  } else {
    initUserWithNick(user, callback);
  }
}

function createUserObject() {
  var user = {
    id: uuid.v4(),
    conversations: {},
    soundEnabled: true,
    notificationsEnabled: true,
  };
  assignGuestNick(user);
  logger.debug('%s created new user object: %j', user.id, user, {});
  return user;
}

function initUserWithoutNick(user, callback) {
  logger.warn('%s user from db had no nick name.', user.id);
  assignGuestNick(user);
  process.nextTick(function() {
    callback(user);
  });
}

function initUserWithNick(user, callback) {
  // User was found in database from by the id from their cookie. Since we
  // do not reserve names for unregistered users, an unregistered user
  // coming online might discover that the nick name they had last time is
  // currently in use by another user.
  nameAvailable.isAvailable(user.nick, user.id, function(err, available) {
    if (err) {
      logger.warn('%s ignoring error during name availibility check for %s: %j', user.id, user.nick, err, {});
      available = false;
      // ignore error, assign guest name and move on
    }

    if (!available) {
      assignGuestNick(user);
    }
    callback(user);
  });
}

function assignGuestNick(user) {
  user.nick = 'Guest-' + genId.generate();
  logger.debug('%s assigned guest nick name: %s', user.id, user.nick);
}
