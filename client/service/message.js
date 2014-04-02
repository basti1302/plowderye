'use strict';

module.exports = function(socket,
  $rootScope,
  ConversationService,
  UserService,
  SoundService,
  NotificationService) {

  var self = this;
  var messages = {};

  function createMessage(text) {
    var clientTime = Date.now();
    var currentConversation = ConversationService.getCurrentConversation();
    if (!currentConversation) {
      return;
    }
    // TODO Only send user's id and nick, not the full object
    return {
      sender: UserService.getUser(),
      conversation: currentConversation.id,
      text: text,
      clientTime: clientTime,
      clientId: clientTime + '-' + randomString(),
      system: false,
    };
  }

  function createSystemMessage(text) {
    var clientTime = Date.now();
    var currentConversation = ConversationService.getCurrentConversation();
    if (!currentConversation) {
      return;
    }
    return {
      sender: { nick: '::' },
      conversation: currentConversation.id,
      text: text,
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

  this.getMessages = function() {
    var currentConversation = ConversationService.getCurrentConversation();
    if (!currentConversation) {
      return [];
    }
    var conversationId = currentConversation.id;
    return messages[conversationId];
  };

  this.send = function(text) {
    var message = createMessage(text);
    this.addLocally(angular.copy(message));
    socket.emit('message', message);
  };

  this.displaySystemMessageInCurrentConversation = function(text) {
    var message = createSystemMessage(text);
    this.addLocally(message);
  };

  this.displaySystemMessageInConversation = function(text, conversationId) {
    var message = createSystemMessage(text);
    message.conversation = conversationId;
    this.addLocally(message);
  };

  this.addLocally = function(message) {
    var conversationId = message.conversation;
    if (!conversationId) {
      log.error('Message without conversation id:');
      log.error(JSON.stringify(message));
      return;
    }
    format(message);
    log.debug('adding message:');
    log.debug(JSON.stringify(message, null, 2));
    var convLog = messages[conversationId];
    if (!convLog) {
      convLog = [];
      messages[conversationId] = convLog;
    }
    convLog.push(message);
  };

  socket.on('message', function (message) {
    self.addLocally(message);
    SoundService.playSound('ping');
    NotificationService.notify(message);
  });

  $rootScope.$on('user-left-conversation', function(event, conversationId) {
    delete messages[conversationId];
  });

  $rootScope.$on('display-system-message', function(event, message) {
    if (!message.conversation) {
      return;
    }
    if (message.conversation === '*') {
      self.displaySystemMessageInCurrentConversation(message.text);
    } else {
      self.displaySystemMessageInConversation(message.text,
        message.conversation);
    }
  });
};
