'use strict';

var logger  = require('./logger')
  , storage = require('./storage')
  ;

/*
 * Checks if the given name if unused, or, if it is in use, is used by the given
 * id (which is then also interpreted as available). The use case for the latter
 * is to check if a unregistered user coming online can use the name they had
 * last time. If no one else claimed the name in between, it is still stored
 * with their id. If given id == null, the name only counts as available if it
 * is completely unused (not in the LevelDB database that stores name-id pairs.
 */
exports.isAvailable = function(name, id, callback) {
  storage.fetchUserName(name, function(err, _id) {
    if (err && err.notFound) {
      logger.debug('Name %s not in use.', name);
      return callback(null, true);
    } else if (err) {
      logger.error('%s Unknown error during availability check for name %s.', id, name);
      return callback(err, null);
    }
    logger.debug('Found id %s for name %s. Current users id is %s.', _id, name, id);
    if (id !== _id) {
      logger.debug('%s nick name from db (%s) is not available for user.', id, name);
      return callback(null, false);
    } else {
      return callback(null, true);
    }
  });
};

