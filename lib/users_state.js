'use strict';

var logger = require('./logger');

var nickNames = {};
var namesUsed = [];
var guestNumber = 1;

exports.init = function() {
};

exports.getUserBySocket = function(socket) {
  return getUserBySocketId(socket.id);
};

function getUserBySocketId(socketId) {
  return nickNames[socketId];
};

exports.getInitialNick = function(socket, nickFromCookie) {
  var nick;
  if (nickFromCookie && !namesUsed[nickFromCookie]) {
    nick = nickFromCookie;
  } else {
    var nick = 'Guest' + guestNumber;
    guestNumber++;
  }
  setNickName(socket, nick);
  namesUsed.push(nick);
  return nick;
};

function setNickName(socket, nick) {
  nickNames[socket.id] = nick;
};

exports.isAllowed = function(name) {
  return name.indexOf('Guest') != 0;
};

exports.isAvailable = function(name) {
  return namesUsed.indexOf(name) === -1;
};

exports.rename = function(socket, name) {
  var previousName = module.exports.getUserBySocket(socket);
  var previousNameIndex = namesUsed.indexOf(previousName);
  namesUsed.push(name);
  setNickName(socket, name);
  delete namesUsed[previousNameIndex];
};

exports.onUserDisconnect = function(socket) {
  var nick = module.exports.getUserBySocket(socket);
  logger.debug('%s disconnect (%s)', socket.id, nick);
  var nameIndex = namesUsed.indexOf(nick);
  delete namesUsed[nameIndex];
  delete nickNames[socket.id];
};
