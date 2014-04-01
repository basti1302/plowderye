'use strict';

var _       = require('lodash')
  , async   = require('async')
  ;

var logger  = require('./logger')
  , storage = require('./storage')
  ;

/*
 * Fetches all conversation objects for the conversations the user participates
 * in and calls the given callback with the list of conversation objects.
 */
module.exports = function(request, callback) {
  var conversationIds = request.user.conversations;
  logger.debug('%s Fetching conversations: %j', request.id, conversationIds, {});
  async.map(

    // for all conversation ids
    _.keys(conversationIds),

    // load the full conversation object
    _.curry(fetchOneConversationById)(request),

    // pass the list of conversation objects back
    function(err, conversations) { //
      if (err) { return callback(err); }
      logger.debug('%s Gathered conversations: %j', request.id, conversations, {});
      // Remove nulls (conversations that haven't been found) from conversation array
      conversations = _.filter(conversations, function (c) { return c !== null; });
      return callback(null, request, conversations);
    }
  );
};

function fetchOneConversationById(request, conversationId, callback) {
  logger.debug('%s Looking for conversation: %s.', request.id, conversationId);
  storage.fetchConversation(conversationId, function(err, conversation) {
    if (err) {
      // ignore error and continue with next conversation
      logger.error(err);
      return callback(null, null);
    }
    if (conversation) {
      logger.debug('%s Found stored conversation: %s.', request.id, conversation.id);
      return callback(null, conversation);
    } else {
      logger.debug('%s A conversation stored for this user does not exist: %s', request.id, conversationId);
      return callback(null, null);
    }
  });
}
