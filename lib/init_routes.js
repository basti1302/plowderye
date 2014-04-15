'use strict';

var _       = require('lodash');

var logger  = require('./logger')
  , Request = require('./request')
  , storage = require('./storage')
  ;

// socket.io request handlers
var addUserByName = require('./handler/add_user_by_name')
  , createConversation = require('./handler/create_conversation')
  , createOneOnOneConversation = require('./handler/create_one_on_one_conversation')
  , disconnect = require('./handler/disconnect')
  , enableSound = require('./handler/enable_sound')
  , enableNotifications = require('./handler/enable_notifications')
  , joinConversation = require('./handler/join_conversation')
  , leaveConversation = require('./handler/leave_conversation')
  , message = require('./handler/message')
  , setName = require('./handler/set_name')
  ;

exports.onNewConnection = function(request, callback) {
  var id = request.id;
  var socket = request.socket;
  socket.on('set-name', _.curry(handle)(socket, id, setName));
  socket.on('enable-sound', _.curry(handle)(socket, id, enableSound));
  socket.on('enable-notifications', _.curry(handle)(socket, id, enableNotifications));
  socket.on('disconnect', _.curry(handle)(socket, id, disconnect));
  socket.on('create-conversation', _.curry(handle)(socket, id, createConversation));
  socket.on('create-one-on-one-conversation', _.curry(handle)(socket, id, createOneOnOneConversation));
  socket.on('join-conversation', _.curry(handle)(socket, id, joinConversation)); socket.on('leave-conversation', _.curry(handle)(socket, id, leaveConversation));
  socket.on('message', _.curry(handle)(socket, id, message));
  socket.on('add-user-to-conversation-by-name', _.curry(handle)(socket, id, addUserByName));

  callback(null, request);
}

function handle(socket, id, handler, data) {
  logger.debug('%s handling socket.io request (data: %j)', id, data, {}) ;
  storage.fetchUser(id, function(err, user) {
    if (err) { return logger.error(err); }
    var request = new Request(id, user, socket);
    handler(request, data);
  });
}
