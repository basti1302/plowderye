(function() {
  'use strict';

  angular
    .module('plowderye')
    .service('ConversationService',
      function(MessageService, socket) {

    function Conversation(name, active) {
      this.name = name;
      this.active = !!active;
    }

    Conversation.prototype.getCssClasses = function() {
      if (this.active) {
        return ['list-group-item', 'active'];
      } else {
        return ['list-group-item'];
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
      socket.emit('join', {
        newConversation: conversation.name
      });
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

    socket.on('fetch-conversations-result', function(conversationNames) {
      // create all conversations that come from server and do not yet exist on
      // client
      conversationNames.forEach(function(conversationName) {
        var existingConversation = conversations[conversationName];
        if (!existingConversation) {
          conversations[conversationName] = new Conversation(conversationName);
        }
      });
      // delete all conversations that exist on client but not on server anymore
      for (var convKey in conversations) {
        if ($.inArray(convKey, conversationNames) < 0) {
          delete conversations[convKey];
        }
      }
    });

    socket.on('join-result', function(result) {
      MessageService.clearMessages();
      if (result.conversation) {
        if (currentConversation) {
          currentConversation.active = false;
        }

        currentConversation = conversations[result.conversation];
        if (currentConversation) {
          // conv is already in user's conv list
          currentConversation.active = true;
        } else {
          // conv is not yet in user's conv list, create it now
          currentConversation = new Conversation(result.conversation, true);
          conversations[currentConversation.name] = currentConversation;
        }
        // MessageService needs to know the current conversation to properly
        // set this attribute in new messages.
        MessageService.setCurrentConversation(currentConversation);
        MessageService.displaySystemMessage('Conversation changed.');
        $.cookie('conversation', currentConversation.name);
      }
    });

    socket.on('conversation-added', function(conversationName) {
      if (!conversations[conversationName]) {
        var conversation = new Conversation(conversationName);
        conversations[conversationName] = conversation;
      }
    });

    socket.on('conversation-removed', function(conversationName) {
      delete conversations[conversationName];
    });
  });

})();
