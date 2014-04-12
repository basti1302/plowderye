'use strict';

var logger = require('./logger');

var sockets = {};

exports.store = function(userId, socketId) {
  logger.debug('%s storing socket id: %s', userId, socketId);
  sockets[userId] = socketId;
};

exports.fetch = fetch;
function fetch(userId) {
  logger.debug('%s fetching socket id: %s', userId, sockets[userId]);
  return sockets[userId];
};

exports.getSocket = function(request, userId) {
  var socketId = fetch(userId);
  if (!socketId) {
    return null;
  }
  return request.socket.namespace.sockets[socketId];
};

exports.remove = function(userId) {
  logger.debug('%s removing socket id: %s', userId, sockets[userId]);
  delete sockets[userId];
};
