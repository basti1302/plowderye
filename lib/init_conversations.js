'use strict';

var _                      = require('lodash')
  , async                  = require('async')
  ;

var addUserToConversation  = require('./add_user_to_conversation')
  , fetchUserConversations = require('./fetch_user_conversations')
  , logger                 = require('./logger')
  , sendConversations      = require('./send_conversations')
  , storage                = require('./storage')
  ;

/*
 * Attention: callback hell ahead!
 * - initCallback: the callback passed from lib/connection_handler#onNewConnection
 *   to init_conversations#onNewConnection
 * - addCallback: passed from init_conversations#onNewConnection to
 *   addUserToStoredConversations. This is also handed to some other functions
 *   down the line.
 */

exports.onNewConnection = function(request, initCallback) {
  addUserToStoredConversations(request, function(err) {
    if (err) { return initCallback(err); }
    sendConversations(request);
    initCallback(null, request);
  });
};

function addUserToStoredConversations(request, addCallback) {
  var conversationIds = request.user.conversations;
  logger.debug('%s Trying initial conversations %j.', request.id, conversationIds, {});

  if (conversationIds == null || Object.keys(conversationIds).length === 0) {
    logger.debug('%s No stored conversations.', request.id);
    return addUserToDefaultConversation(request, addCallback);
  }

  fetchUserConversations(request,
    _.curry(addUserToEachConversations)(addCallback)
  );
}

function addUserToEachConversations(addCallback, err, request, conversations) {
  if (err) { return addCallback(err); }

  // Is the conversation array empty? If so, add user to Lobby.
  if (conversations.length === 0) {
    logger.debug('%s None of the stored conversations did exist.', request.id);
    return addUserToDefaultConversation(request, addCallback);
  } else {
    async.each(conversations,
      function(conversation, eachCallback) {
        addUserToConversation(request, conversation);
        eachCallback(null);
      }, addCallback);
  }
}

function addUserToDefaultConversation(request, addCallback) {
  storage.findConversationByName(global.defaultConversationName, function(err, defaultConversation) {
    if (err) { return addCallback(err); }
    addUserToConversation(request, defaultConversation);
    addCallback(null);
  });
}
