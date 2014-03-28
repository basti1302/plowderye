'use strict';

var uuid = require('node-uuid');

var addUserToConversation = require('../add_user_to_conversation');
var logger = require('../logger');
var storage = require('../storage');


module.exports = function(request, conversation) {
  if (conversation) {
    logger.debug('%s creates %j', request.id, conversation, {});
    createConversation(request, conversation);
  }
};

function createConversation(request, _conversation) {
  if (_conversation.name) {
    var conversation = create(_conversation.name);
    global.io.sockets.emit('conversation-added', conversation);
    addUserToConversation.add(request, conversation);
  } else {
    logger.warn('%s Client provided no conversation name when trying to create a new conversation. Ignoring create request. %j', request.id, _conversation, {});
  }
}

function create(name) {
  var conversation = {
    id: uuid.v4(),
    name: name,
  };
  logger.debug('created conversation %j', conversation, {});
  storage.storeConversation(conversation);
  return conversation;
}

module.exports.createDefaultConversation = function(callback) {
  storage.doesConversationExist(global.defaultConversationName, function(err, exists) {
    if (err || !exists) {
      logger.info('creating default conversation.');
      create(global.defaultConversationName);
    }
    callback(null);
  });
};
