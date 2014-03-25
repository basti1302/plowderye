'use strict';

var _ = require('lodash');

var logger = require('./logger');
var Request = require('./request');
var storage = require('./storage');
var users = require('./users');

// socket.io request handlers
var setName = require('./handler/set_name');
var enableSound = require('./handler/enable_sound');
var enableNotifications = require('./handler/enable_notifications');
var disconnect = require('./handler/disconnect');
var createConversation = require('./handler/create_conversation');
var joinConversation = require('./handler/join_conversation');
var message = require('./handler/message');

exports.onNewConnection = function(socket, user) {
  initRoutes(socket, user.id);
};

function initRoutes(socket, id) {
  socket.on('set-name', _.curry(handle)(socket, id, setName));
  socket.on('enable-sound', _.curry(handle)(socket, id, enableSound));
  socket.on('enable-notifications', _.curry(handle)(socket, id, enableNotifications));
  socket.on('disconnect', _.curry(handle)(socket, id, disconnect));
  socket.on('create-conversation', _.curry(handle)(socket, id, createConversation));
  socket.on('join-conversation', _.curry(handle)(socket, id, joinConversation));
  socket.on('message', _.curry(handle)(socket, id, message));
}

function handle(socket, id, handler, data) {
  logger.debug('%s handling socket.io request (data: %j)', id, data, {}) ;
  storage.fetchUser(id, function(err, user) {
    if (err) { return logger.error(err); }
    var request = new Request(id, user, socket);
    handler(request, data);
  });
}
