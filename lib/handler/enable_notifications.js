'use strict';

var logger = require('../logger');
var storage = require('../storage');

module.exports = function(request, enabled) {
  logger.debug('%s enable notifications: %s', request.id, enabled);
  user.notificationsEnabled = enabled;
  storage.storeUser(user);
};
