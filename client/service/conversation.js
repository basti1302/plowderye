'use strict';

var angular = require('angular')
  , logger = require('loglevel')
  ;

var _      = {};
_.omit     = require('lodash.omit');
_.values   = require('lodash.values');

angular
  .module('plowderye')
  .service('ConversationService', function(socket, $rootScope) {

  var self = this;
  var conversations = {};
  var currentConversation = {};

  this.getUserConversations = function() {
    return filter(function(conversation) {
      return !conversation.participates;
    });
  };

  this.getPublicConversations = function() {
    return filter(function(conversation) {
      return conversation.participates || !conversation.public;
    });
  };

  function filter(fn) {
    // 1. _.omit: filter conversations according to given filter function (for
    // user conversations or public conversations),
    // 2. _.values: convert object to array and finally
    // 3. sort by name
    return sort(_.values(_.omit(conversations, fn)));
  }

  function sort(c) {
    return c.sort(function (a, b) {
      if (a.name > b.name) {
        return 1;
      } else if (a.name < b.name) {
        return -1;
      } else {
        return 0;
      }
    });
  }

  this.getCurrentConversation = function() {
    return currentConversation;
  };

  this.getConversationName = function(conversationId) {
    if (conversations[conversationId]) {
      return conversations[conversationId].name;
    }
    return null;
  };

  this.switchTo = function(conversation) {
    if (!conversation) {
      return;
    }
    deactivateCurrentConversation();
    currentConversation = conversation;
    $.cookie('conversation-id', conversation.id);
    activateCurrentConversation();
  };

  $rootScope.$on('switch-to-conversation-by-id',
      function(event, conversationId) {
    self.switchToById(conversationId);
  });

  this.switchToById = function(conversationId) {
    var conv = conversations[conversationId];
    if (conv) {
      this.switchTo(conv);
    }
  };

  this.join = function(conversation) {
    var convToServer;
    if (conversation.id) {
      convToServer = {
        id: conversation.id,
        name: conversation.name,
      };
    } else {
      convToServer = {
        name: conversation.name,
      };
    }
    socket.emit('join-conversation', convToServer);
  };

  this.joinOrSwitchTo = function(conversationName) {
    for (var c in conversations) {
      var conversation = conversations[c];
      if (conversation.name.toUpperCase() === conversationName.toUpperCase()) {
        this.switchTo(conversation);
        return;
      }
    }

    // try to join a public conversation with the given name, that the user does
    // not yet participate in.
    this.join({ name: conversationName });
  };

  socket.on('join-result', function(result) {
    var conversation = result.conversation;
    if (!conversation) {
      return;
    }

    conversation.participates = true;
    deactivateCurrentConversation();

    mergeServerConversation(conversation);
    currentConversation = conversations[conversation.id];
    activateCurrentConversation();
  });

  this.leave = function() {
    if (currentConversation) {
      socket.emit('leave-conversation', currentConversation.id);
    }
    $rootScope.$emit('user-left-conversation', currentConversation.id);
    currentConversation = null;
  };

  this.create = function(conversationName) {
    socket.emit('create-conversation', { name: conversationName });
  };

  this.addUserToCurrentConversation = function(userName) {
    socket.emit('add-user-to-conversation-by-name', {
      userName: userName,
      conversationId: currentConversation.id,
    });
  };

  this.createOneOnOneConversation = function(otherUser) {
    if (!otherUser) {
      return;
    }
    socket.emit('create-one-on-one-conversation', otherUser.id);
  };

  socket.on('user-conversation-list', function(conversationsFromServer) {
    logger.trace('user-conversation-list');
    logger.trace(JSON.stringify(conversationsFromServer, null, 2));
    for (var c in conversationsFromServer) {
      conversationsFromServer[c].participates = true;
    }
    merge(conversationsFromServer);
    var conversationId = $.cookie('conversation-id');
    if (conversationId) {
      self.switchToById(conversationId);
    }
  });

  socket.on('public-conversation-list', function(conversationsFromServer) {
    logger.trace('public-conversation-list');
    logger.trace(JSON.stringify(conversationsFromServer, null, 2));
    for (var c in conversationsFromServer) {
      conversationsFromServer[c].public = true;
    }
    merge(conversationsFromServer);
  });

  socket.on('conversation-added', function(conversation) {
    addFromServerIfNotPresent(conversation);
  });

  socket.on('conversation-removed', function(conversationId) {
    delete conversations[conversationId];
  });

  socket.on('switch-to-conversation', function(conversationId) {
    self.switchToById(conversationId);
  });

  function merge(conversationsFromServer) {
    // create all conversations that come from server and do not yet exist on
    // client
    for (var c in conversationsFromServer) {
      mergeServerConversation(conversationsFromServer[c]);
    }

    // delete all conversations that exist on client but not on server anymore
    for (var clientConvId in conversations) {
      var foundMatching = false;
      for (var serverConvId in conversationsFromServer) {
        if (clientConvId === serverConvId) {
          // found a matching server conversation, continue with next client
          // conversation
          foundMatching = true;
          break;
        }
      }

      // no matching conversation found in server conversations, so delete the
      // client conversation
      if (!foundMatching) {
        delete conversations[clientConvId];
      }
    }
  }

  function mergeServerConversation(serverConversation) {
    if (!addFromServerIfNotPresent(serverConversation)) {
      // conversation was already present on client - copy all properties
      // from server conversation to client conversation, just in case they
      // diverged.
      var clientConversation = conversations[serverConversation.id];
      clientConversation.name = serverConversation.name;
      if (angular.isDefined(serverConversation.participates)) {
        clientConversation.participates = serverConversation.participates;
      }
      if (angular.isDefined(serverConversation.public)) {
        clientConversation.public = serverConversation.public;
      }
    }
  }

  function addFromServerIfNotPresent(conversation) {
    if (!conversations[conversation.id]) {
      addFromServer(conversation);
      return true;
    }
    return false;
  }

  function addFromServer(conversation) {
    conversations[conversation.id] = conversation;
  }

  function deactivateCurrentConversation() {
    if (currentConversation) {
      currentConversation.active = false;
    }
  }

  function activateCurrentConversation() {
    currentConversation.active = true;
    $rootScope.$emit('switched-to-conversation', currentConversation);
  }
});
