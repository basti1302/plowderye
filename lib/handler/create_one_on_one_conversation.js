'use strict';

var _                     = require('lodash')
  , async                 = require('async')
  , uuid                  = require('node-uuid')
  ;

var addUserToConversation = require('../add_user_to_conversation')
  , createConversation    = require('../create_conversation').createConversation
  , logger                = require('../logger')
  , socketRegistry        = require('../socket_registry')
  , storage               = require('../storage')
  ;

module.exports = function(request, otherUserId) {

  // 1. Check if this pair of users already has a one-on-one conversation.
  //    If so, activate it for the user requesting the conversation.
  //    Do nothing for the other user.
  // TODO Use async, rm lib/for_each_conversation_user_list
  var conversationIds = _.keys(request.user.conversations);
  var existingOneOnOneConversationId = null;
  async.each(
    conversationIds, function(conversationId, callback) {
      storage.fetchConversationUserList(conversationId, function(err, userList) {
        if (err && err.notFound) {
          logger.warn(err);
          return callback(null);
        } else if (err) {
          return callback(err);
        }
        logger.debug('%s inspecting conversation user list %s: %j',
          request.id, conversationId, userList, {});
        if (_.keys(userList).length === 2) {
          var id1 = _.keys(userList)[0];
          var id2 = _.keys(userList)[1];
          if (id1 === otherUserId || id2 === otherUserId) {
            logger.debug('%s Found existing one on one conversation: %s',
              request.id, conversationId);
            existingOneOnOneConversationId = conversationId;
          }
        }
        callback(null);
      });
    }, function(err) {
      logger.debug('%s FINISHED! FOUND: %s; err: %j', request.id,
        existingOneOnOneConversationId, err, {});

      if (existingOneOnOneConversationId) {
        request.socket.emit('switch-to-conversation',
          existingOneOnOneConversationId);
      } else {
        // 2. If these users do not have a one-on-one conversation, create one.
        //    Add it to both user's conversations lists. Activate it for the user
        //    requesting the conversation.
        storage.fetchUser(otherUserId, function(err, otherUser) {
          createConversation(
            request, {
              name: request.user.nick + ', ' + otherUser.nick,
              private: true,
            },
            function(errr, conversation) {
            if (errr) { return logger.error(errr); }
            logger.debug('%s created one on one conversation: %j',
              request.id, conversation, {});

            // TODO CODE DUPLICATION WITH lib/add_user_to_conversation.js
            // TODO UGLY, UGLY, UGLY!
            request.user.conversations[conversation.id] = {};
            otherUser.conversations[conversation.id] = {};
            storage.storeUser(request.user);
            storage.storeUser(otherUser);
            var userList = {};
            userList[request.user.id] = {};
            userList[otherUser.id] =  {};
            storage.storeConversationUserList(conversation.id, userList);
            request.socket.join(conversation.id);
            request.socket.emit('join-result', { conversation: conversation });
            var otherSocket = socketRegistry.getSocket(request, otherUser.id);
            // the other user doesn't need to be online.
            if (otherSocket) {
              // TODO Right now, this new one-on-one conversations is
              // automatically activated for the other user. It would be nicer
              // to just add the new conv to the conv list with one unread
              // message (could be system message about being invited to a one
              // on one conv).
              otherSocket.join(conversation.id);
              otherSocket.emit('join-result', { conversation: conversation });
            }
          });
        });
      }
    }
  );
};
