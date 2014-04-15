'use strict';

var uuid                  = require('node-uuid');

var logger                = require('./logger')
  , storage               = require('./storage')
  ;

exports.createConversation = function(request, _conversation, callback) {
  create(_conversation, function(err, conversation) {
    if (err) { return callback(err); }
    global.io.sockets.emit('conversation-added', conversation);
    callback(null, conversation);
  });
}

exports.createDefaultConversation = function(callback) {
  // TODO get the default conv name directly from nconf, not from a global
  storage.doesConversationExist(global.defaultConversationName, function(err, exists) {
    if (err || !exists) {
      logger.info('creating default conversation.');
      create({
        name: global.defaultConversationName,
        private: false,
      }, callback);
    } else {
      callback(null);
    }
  });
};

function create(_conversation, callback) {
  var isPrivate =
    (typeof _conversation.private === 'undefined' ||
     _conversation.private === null) ? false : _conversation.private;
  var conversation = {
    id: uuid.v4(),
    name: _conversation.name,
    private: isPrivate,
  };
  logger.debug('created conversation %j', conversation, {});
  storage.storeConversation(conversation, function(err) {
    if (err) {
      if (!callback) { throw err; }
      return callback(err);
    }
    return callback(null, conversation);
  });
}
