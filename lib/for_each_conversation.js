'use strict';

var _           = require('lodash');

var storage     = require('./storage');

module.exports = function(request, fn) {
  _.keys(request.user.conversations).forEach(function(conversationId) {
    storage.fetchConversation(conversationId, function(err, conversation) {
      if (err) {
        logger.error(err);
      } else {
        fn(conversation);
      }
    });
  });
};
