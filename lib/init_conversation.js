'use strict';

var _                     = require('lodash')
  , async                 = require('async')
  ;

var addUserToConversation = require('./add_user_to_conversation')
  , logger                = require('./logger')
  , storage               = require('./storage')
  ;


/*
 * Attention: callback hell ahead!
 * - initCallback: the callback passed from lib/connection_handler#onNewConnection
 *   to init_conversations#onNewConnection
 * - addCallback: passed from init_conversations#onNewConnection to
 *   addUserToInitialConversations. This is also handed to some other functions
 *   down the line.
 */


exports.onNewConnection = function(request, initCallback) {
  addUserToInitialConversations(request, function(err) {
    if (err) { return initCallback(err); }
    sendConversationsToUser(request);
    initCallback(null, request);
  });
};

function addUserToInitialConversations(request, addCallback) {
  var conversationIds = request.user.conversations;
  logger.debug('%s Trying initial conversations %j.', request.id, conversationIds, {});

  if (conversationIds == null || Object.keys(conversationIds).length === 0) {
    logger.debug('%s No stored conversations.', request.id);
    return addUserToDefaultConversation(request, addCallback);
  }

  async.map(
    Object.keys(conversationIds),
    _.curry(fetchOneConversationById)(request),
    _.curry(addUserToLoadedConversations)(request, addCallback)
  );
}

function fetchOneConversationById(request, conversationId, transformedCallback) {
  storage.fetchConversation(conversationId, function(err, conversation) {
    if (err) {
      // ignore error and continue with next conversation
      logger.error(err);
      return transformedCallback(null, null);
    }
    if (conversation) {
      logger.debug('%s Found stored initial conversation: %s.', request.id, conversation.id);
      return transformedCallback(null, conversation);
    } else {
      logger.debug('%s A conversation stored for this user does not exist: %s', request.id, request.user.conversationId);
      return transformedCallback(null, null);
    }
  });
}

function addUserToLoadedConversations(request, addCallback, err, conversations) {
  // Remove nulls (conversations that haven't been found) from conversation array
  conversations = _.filter(conversations, function (c) { return c !== null; });
  // Does that leave the conversation array empty? If so, add user to Lobby
  if (conversations.length === 0) {
    logger.debug('%s None of the stored conversations did exist.', request.id);
    return addUserToDefaultConversation(request, addCallback);
  } else {
    async.each(conversations,
      function(conversation, eachCallback) {
        addUserToConversation.add(request, conversation);
        eachCallback(null);
      }, addCallback);
  }
}

function addUserToDefaultConversation(request, addCallback) {
  storage.findConversationByName(global.defaultConversationName, function(err, defaultConversation) {
    if (err) { return addCallback(err); }
    addUserToConversation.add(request, defaultConversation);
    addCallback(null);
  });
}

function sendConversationsToUser(request) {
  // TODO Right now we just send all existing conversations - send only the ones
  // the user is in
  storage.fetchConversationsForUser(request.user, function(err, conversations) {
    if (err) { return logger.error(err); }
    logger.debug('%s sendConversations %j', request.id, conversations, {});
    request.socket.emit('fetch-conversations-result', conversations);
  });
}
