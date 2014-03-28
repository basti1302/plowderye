'use strict';

var logger = require('../logger')
  , storage = require('../storage')
  ;

module.exports = function(request, enabled) {
  logger.debug('%s enable sound: %s', request.id, enabled);
  request.user.soundEnabled = enabled;
  storage.storeUser(request.user);
};
