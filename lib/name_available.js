'use strict';

var logger = require('./logger');
var storage = require('./storage');

exports.isAvailable = function(name, id, callback) {
  storage.fetchUserName(name, function(err, _id) {
    if (err && err.notFound) {
      logger.debug('Name %s not in use.', id, name);
     return callback(null, true);
    } else if (err) {
      logger.error('%s Unknown error during availability check for name %s.', id, name);
      return callback(err, null);
    }
    logger.debug('%s Found id %s for name %s.', id, _id, name);
    if (id && id !== _id) {
      logger.debug('%s nick name from db (%s) is not available for user.', id, name);
      return callback(null, false);
    } else {
      return callback(null, true);
    }
  });
};

