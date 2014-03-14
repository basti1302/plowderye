(function() {
  'use strict';

  angular
    .module('plowderye')
    .service('ConversationService',
      function(MessageService, socket) {

    var cssClassesActive = ['sidebar-item-borders', 'conv-item', 'grad-ld', 'sidebar-item-active'];
    var cssClassesInactive = ['sidebar-item-borders', 'conv-item', 'grad-ld'];

    function getCssClasses() {
      if (this.active) {
        return cssClassesActive;
      } else {
        return cssClassesInactive;
      }
    };

    var conversations = {};
    var currentConversation = {};

    this.getConversations = function() {
      return conversations;
    }

    this.getCurrentConversation = function() {
      return currentConversation;
    }

    this.join = function(conversation) {
      var convToServer;
      if (conversation.id) {
        convToServer = {
          id: conversation.id,
          name: conversation.name,
        }
      } else {
        convToServer = {
          name: conversation.name,
        }
      }
      socket.emit('join-conversation', convToServer);
    };

    this.create = function(conversation) {
      socket.emit('create-conversation', conversation);
    };

    /*
    TODO Makes no sense unless a user can join multiple conversations!
    this.addUserToCurrentConversation = function(user) {
      socket.emit('add-user-to-conversation', {
        user: user,
        conversation: currentConversation.name,
      });
    };
    */

    socket.on('fetch-conversations-result', function(_conversations) {

      // create all conversations that come from server and do not yet exist on
      // client
      for (var c in _conversations) {
        mergeServerConversation(_conversations[c]);
      }

      // delete all conversations that exist on client but not on server anymore
      for (var clientConvId in conversations) {
        var foundMatching = false;
        for (var serverConvId in _conversations) {
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
    });

    socket.on('join-result', function(result) {
      MessageService.clearMessages();
      var conversation = result.conversation;
      if (conversation) {
        if (currentConversation) {
          currentConversation.active = false;
        }

        mergeServerConversation(conversation);
        currentConversation = conversations[conversation.id];
        currentConversation.active = true;

        // MessageService needs to know the current conversation to properly
        // set this attribute in new messages.
        MessageService.setCurrentConversation(currentConversation);
        MessageService.displaySystemMessage('Conversation changed.');
        $.cookie('conversation', currentConversation.id);
      }
    });

    socket.on('conversation-added', function(conversation) {
      addFromServerIfNotPresent(conversation);
    });

    socket.on('conversation-removed', function(conversationId) {
      delete conversations[conversationId];
    });

    function mergeServerConversation(conversation) {
      if (!addFromServerIfNotPresent(conversation)) {
        // conversation was already present on client - copy all properties
        // from server conversation to client conversation, just in case they
        // diverged. (Currently, there is only the name property, however.)
        conversations[conversation.id].name = conversation.name;
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
      conversation.getCssClasses = getCssClasses.bind(conversation);
      conversations[conversation.id] = conversation;
    }

  });

})();
