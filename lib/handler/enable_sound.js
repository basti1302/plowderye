'use strict';

var logger = require('../logger');
var storage = require('../storage');

module.exports = function(request, enabled) {
  logger.debug('%s enable sound: %s', request.id, enabled);
  user.soundEnabled = enabled;
  storage.storeUser(user);
};
