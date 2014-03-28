'use strict';

var logger  = require('../logger')
  , storage = require('../storage')
  ;

module.exports = function(request, enabled) {
  logger.debug('%s enable notifications: %s', request.id, enabled);
  request.user.notificationsEnabled = enabled;
  storage.storeUser(request.user);
};
