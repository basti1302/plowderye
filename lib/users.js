'use strict';

var cookieParser = require('cookie');
var logger = require('./logger');

var io;

var convState = require('./conversations_state');
var messageUtil = require('./message_util');
var storage = require('./storage');
var initUser = require('./init_user');

exports.setIo = function(_io) {
  io = _io;
};

exports.onNewConnection = function(socket, callback) {
  var idFromCookie = readCookie(socket);
  initUser.onNewConnection(idFromCookie, function(user) {
    var id = user.id
    logger.debug('%s initialised user: %j', id, user, {});
    socket.emit('init-user-result', user);
    callback(null, user);
  });
};

function readCookie(socket) {
  var cookieString = socket.handshake.headers['cookie'];
  logger.debug('reading cookie for socket %s: %s', socket.id, cookieString);
  if (!cookieString) {
    return null;
  }
  var cookie = cookieParser.parse(cookieString);
  logger.debug('cookie for socket %s: %j', socket.id, cookie, {});
  if (!cookie) {
    return null;
  }
  return cookie.id;
}

// TODO Move somewhere else
exports.sendUsersInConversation = sendUsersInConversation;
function sendUsersInConversation(request) {
  var id = request.id;
  var socket = request.socket;
  logger.debug('%s sending users in conversation.', id);
  var conversation = convState.getConversationBySocket(socket);
  if (conversation) {
    logger.debug('%s sending users for conversation with id %s', id, conversation.id, {});
    // TODO It's quite ugly to iterate over *all* users only to find the users
    // that participate in a specific conversation. Store both relations in
    // LevelDB.
    // TODO Maybe send only id and nick of users (but not for current user
    // because current user object might be replaced with the object from this
    // collection)
    storage.fetchUsersInConversation(conversation.id, function(err, usersInConversation) {
      if (err) { logger.error(err); }
      socket.emit('users-in-current-conversation', usersInConversation);
    });
  } else {
    logger.debug('%s no conversation for user.', id);
  }
}
