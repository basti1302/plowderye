'use strict';

var _ = require('lodash');
var cookieParser = require('cookie');

var logger = require('./logger');
var storage = require('./storage');
var userFilter = require('./user_filter');

exports.send = send;
function send(request) {
  var id = request.id;
  var socket = request.socket;
  if (request.user.conversationId) {
    logger.debug('%s sending users for conversation with id %s', request.id, request.user.conversationId);

    // TODO It's quite ugly to iterate over *all* users only to find the users
    // that participate in a specific conversation. Store both relations in
    // LevelDB. (see storage#fetchUsersInConversation)
    storage.fetchUsersInConversation(request.user.conversationId, function(err, usersInConversation) {
      if (err) { return logger.error(err); }
      usersInConversation = _.map(usersInConversation, _.curry(userFilter.filterExcept)(request.user.id));
      socket.emit('users-in-current-conversation', usersInConversation);
    });
  } else {
    return logger.debug('%s no conversation for user.', id);
  }
}
