'use strict';

var _            = require('lodash');

var logger       = require('./logger')
  , storage      = require('./storage')
  , userFilter   = require('./user_filter')
  ;

// TODO We should not store all users in memory. It's only used to send a list
// of all users to the client - which is a feature that should also not exist.
// This should be replaced with some sort of managing contacts for users and
// having a list of contacts for each user, which will be send to the client
// instead of a list of all users.
module.exports = function(request, initCallback) {
  storage.fetchAllUsers(function(err, users) {
    if (err) { return initCallback(err); }
    users = _.transform(users, function(result, usr, key) {
      result[key] = userFilter.filterExcept(request.user.id, usr);
    });
    users[request.id] = request.user;
    logger.debug('send_users - emitting: %j', users, {});
    request.socket.emit('user-list', users);
    return initCallback(null, request);
  });
}
