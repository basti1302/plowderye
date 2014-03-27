'use strict';

var cookieParser = require('cookie');

var logger = require('./logger');
var storage = require('./storage');

exports.send = send;
function send(request) {
  var id = request.id;
  var socket = request.socket;
  if (request.user.conversationId) {
    logger.debug('%s sending users for conversation with id %s', request.id, request.user.conversationId);

    // TODO It's quite ugly to iterate over *all* users only to find the users
    // that participate in a specific conversation. Store both relations in
    // LevelDB. (see storage#fetchUsersInConversation)

    // TODO Maybe send only id and nick of users (but not for current user
    // because current user object might be replaced with the object from this
    // collection)

    storage.fetchUsersInConversation(request.user.conversationId, function(err, usersInConversation) {
      if (err) { return logger.error(err); }
      socket.emit('users-in-current-conversation', usersInConversation);
    });
  } else {
    return logger.debug('%s no conversation for user.', id);
  }
}
