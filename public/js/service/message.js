(function() {
  'use strict';

  angular
    .module('plowderye')
    .service('MessageService',
      function(socket,
        $rootScope,
        ConversationService,
        UserService,
        SoundService,
        NotificationService) {

    var self = this;
    var messages = [];

    function createMessage(messageText) {
      var clientTime = Date.now();
      var currentConversation = ConversationService.getCurrentConversation();
      var conversationId = currentConversation ? currentConversation.id : null;
      return {
        sender: UserService.getUser(),
        conversation: conversationId,
        text: messageText,
        clientTime: clientTime,
        clientId: clientTime + '-' + randomString(),
        system: false,
      };
    }

    function createSystemMessage(messageText) {
      var clientTime = Date.now();
      return {
        sender: { nick: '::' },
        text: messageText,
        clientTime: clientTime,
        clientId: clientTime + '-' + randomString(),
        system: true,
      };
    }

    function format(message) {
      formatSender(message);
      formatTime(message);
      formatText(message);
      message.classes = message.system ? ['system-message'] : [];
      return message;
    }

    function formatSender(message) {
      if (message.sender && message.sender.nick != null) {
        message.formattedSender = message.sender.nick;
      } else {
        message.formattedSender = '?';
      }
    }

    function formatTime(message) {
      if (message.serverTime || message.clientTime) {
        var date = new Date(message.serverTime || message.clientTime);
        message.formattedTime =
        ' [' +
        date.toLocaleDateString() +
        ' - ' +
        date.toLocaleTimeString() +
        ']:'
        ;
      } else {
        message.formattedTime = '[?]';
      }
      return message;
    }

    function formatText(message) {
      if (message.text) {
        message.formattedText = message.text;
      } else {
        message.formattedText = '';
      }
    }

    function randomString()  {
      return ('' + Math.random()).substr(2, 4);
    }

    this.clearMessages = function() {
      messages = [];
    }

    this.getMessages = function() {
      return messages;
    };

    this.send = function(messageText) {
      var message = createMessage(messageText);
      this.addLocally(angular.copy(message));
      socket.emit('message', message);
    };

    this.displaySystemMessage = function(messageText) {
      var message = createSystemMessage(messageText);
      this.addLocally(message);
    };

    this.addLocally = function(message) {
      var currentConversation = ConversationService.getCurrentConversation();
      if (currentConversation &&
          currentConversation.id &&
          message.conversation &&
          message.conversation !== currentConversation.id) {
        return;
      }

      format(message);
      log.debug('adding message:');
      log.debug(JSON.stringify(message, null, 2));
      messages.push(message);
    };

    socket.on('message', function (message) {
      self.addLocally(message);
      SoundService.playSound('ping');
      NotificationService.notify(message);
    });

    $rootScope.$on('display-system-message', function(event, message) {
      self.displaySystemMessage(message);
    });

    $rootScope.$on('conversation-changed', function(event) {
      self.clearMessages();
    });
  });

})();
