'use strict';

var logger = require('./logger');

var usersBySocket = {};
var namesUsed = [];
var guestNumber = 1;

exports.initUser = function(socket, user) {
  logger.debug('%s init user %j', socket.id, user, {});
  if (user.nick &&
    isAvailable(user.nick) &&
    isAllowed(user.nick)) {
    logger.debug('%s using nick name from cookie: %s', socket.id, user.nick);
    // nick name from cookie exists and can be used
  } else {
    user.nick = 'Guest' + guestNumber;
    guestNumber++;
    logger.debug('%s assigned guest nick name: %s', socket.id, user.nick);
  }
  // TODO For now we just use the socket id as the user's id -
  // until persistent users/login stuff is implemented
  user.id = socket.id;
  setUserBySocket(socket, user);
  namesUsed.push(user.nick);
  return user;
};

exports.init = function() {
  // nothing to do (currently)
};

exports.getUsers = function() {
  return usersBySocket;
};

exports.getUserBySocket = getUserBySocket;
function getUserBySocket(socket) {
  return getUserBySocketId(socket.id);
};

function getUserBySocketId(socketId) {
  return usersBySocket[socketId];
};

function setUserBySocket(socket, user) {
  usersBySocket[socket.id] = user;
};

exports.isAllowed = isAllowed;
function isAllowed(name) {
  return name.indexOf('Guest') != 0;
};

exports.isAvailable = isAvailable;
function isAvailable(name) {
  return namesUsed.indexOf(name) < 0;
};

exports.rename = function(socket, name) {
  logger.debug('%s rename(%s)', socket.id, name);
  var user = getUserBySocket(socket);
  if (user) {
    var previousName = user.nick;
    deleteUsedName(previousName);
    namesUsed.push(name);
    user.nick = name;
    logger.debug('%s renamed from %s to %s', socket.id, previousName, user.nick);
  } else {
    logger.warn('%s rename - unknown user', socket.id);
  }
};

exports.onUserDisconnect = function(socket) {
  logger.debug('%s onUserDisconnect', socket.id);
  var user = getUserBySocket(socket);
  if (user) {
    logger.debug('%s (%s) disconnects.', socket.id, user.nick);
    deleteUsedName(user.nick);
    delete usersBySocket[socket.id];
  } else {
    logger.warn('%s onUserDisconnect - unknown user', socket.id);
  }
};

function deleteUsedName(name) {
  var index = namesUsed.indexOf(name);
  delete namesUsed[index];
}
