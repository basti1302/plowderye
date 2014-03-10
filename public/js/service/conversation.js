(function() {
  'use strict';

  angular
    .module('plowderye')
    .service('ConversationService',
      function(MessageService, socket, $interval) {

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
        newRoom: conversation.name
      });
    };

    socket.on('fetch-rooms-result', function(conversationNames) {
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
      if (result.room) {
        if (currentConversation) {
          currentConversation.active = false;
        }

        currentConversation = conversations[result.room];
        if (currentConversation) {
          // conv is already in user's conv list
          currentConversation.active = true;
        } else {
          // conv is not yet in user's conv list, create it now
          currentConversation = new Conversation(result.room, true);
          conversations[currentConversation.name] = currentConversation;
        }
        // MessageService needs to know the current conversation to properly
        // set this attribute in new messages.
        MessageService.setCurrentConversation(currentConversation);
        MessageService.displaySystemMessage('Room changed.');
        $.cookie('room', currentConversation.name);
      }
    });

    // TODO This is nonsense. server knows all users and conversations and can
    // emit user lists on its own, without being polled.
    $interval(function() {
      socket.emit('fetch-rooms');
    }, 10000);
  });

})();
