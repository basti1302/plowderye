'use strict';

var _            = require('lodash')
  , cookieParser = require('cookie')
  ;

var logger       = require('./logger')
  , storage      = require('./storage')
  , userFilter   = require('./user_filter')
  ;

exports.send = send;
function send(request, conversation) {
  var id = request.id;
  var socket = request.socket;
  logger.debug('%s sending users for conversation with id %s', request.id, conversation.id);

  // TODO It's quite ugly to iterate over *all* users only to find the users
  // that participate in a specific conversation. Store both relations in
  // LevelDB. (see storage#fetchUsersInConversation)
  storage.fetchUsersInConversation(conversation.id, function(err, usersInConversation) {
    if (err) { return logger.error(err); }
    _.transform(usersInConversation, function(result, usr, key) {
      result[key] = userFilter.filterExcept(request.user.id, usr);
    });
    socket.emit('users-in-current-conversation', usersInConversation);
  });
}
