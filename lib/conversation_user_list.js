'use strict';

var cookieParser = require('cookie');

var convState = require('./conversations_state');
var logger = require('./logger');
var storage = require('./storage');

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
