'use strict';

var angular = require('angular')
  , logger  = require('loglevel')
  ;

angular
  .module('plowderye')
  .service('MessageService', function(socket,
  $rootScope,
  ConversationService,
  UserService,
  SoundService,
  NotificationService) {

  var self = this;
  var messages = {};
  var currentConversation;
  var unreadCount = {};

  function createMessage(text) {
    var clientTime = Date.now();
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
    addConversationName(message);
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

  function addConversationName(message) {
    if (message.conversation) {
      message.conversationName =
        ConversationService.getConversationName(message.conversation);
    }
  }

  function randomString()  {
    return ('' + Math.random()).substr(2, 4);
  }

  this.getMessages = function() {
    return getMessagesFor(currentConversation);
  };

  function getMessagesFor(conversation) {
    if (!conversation) {
      return [];
    }
    return messages[conversation.id];
  }

  /*
  function getLastMessageFor(conversation) {
    var messageArray = getMessagesFor(conversation);
    if (messageArray && messageArray.length > 0) {
      return messageArray[messageArray.length - 1];
    } else {
      return null;
    }
  };
  */

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
      logger.error('Message without conversation id:');
      logger.error(JSON.stringify(message));
      return;
    }
    format(message);
    logger.debug('adding message:');
    logger.debug(JSON.stringify(message, null, 2));
    var convLog = messages[conversationId];
    if (!convLog) {
      convLog = [];
      messages[conversationId] = convLog;
    }
    convLog.push(message);
  };

  this.unreadMessageCount = function(conversation) {
    if (!conversation) {
      return 0;
    }
    if (angular.isUndefinedOrNull(unreadCount[conversation.id])) {
      return 0;
    }
    return unreadCount[conversation.id];

    /*
    if (!this.hasUnreadMessages) {
      return '';
    }
    var msgs = getMessageFor(conversation);
    var lastMessage = getLastMessageFor(conversation);
    var lastRead = readUntil[conversation.id];
    var foundLastRead = false;
    var unreadCount = 0;
    for (var i = 0; i < msgs.length; i++) {
      var msg = msgs[i];
      if (!foundLastRead) {
        if (lastRead === msg.id || lastRead === msg.clientId) {
          foundLastRead = true;
        }
      } else {
        unreadCount++;
      }
    }
    */
  };

  this.hasUnreadMessages = function(conversation) {
    return this.unreadMessageCount(conversation) > 0;

    /*
    // How to meaningfull calculating meaningfull unread messages count for
    // current conversation? Would need to check scrolling position
    // (glued or not, at which message) and if browser window has focus etc.
    if (currentConversation && currentConversation.id === conversation.id) {
      return false;
    }
    if (!readUntil[conversation.id] ||
        readUntil[conversation.id] === readLowVal) {
      return false;
    }
    var lastMessage = getLastMessageFor(conversation);
    if (!lastMessage) {
      return false;
    }
    if (readUntil[conversation.id] === lastMessage.id ||
      readUntil[conversation.id] === lastMessage.clientId) {
      return false;
    }
    return true;
    */
  };

  socket.on('message', function (message) {
    self.addLocally(message);
    SoundService.playSound('ping');
    NotificationService.notify(message);
    if (currentConversation.id !== message.conversation) {
      if (angular.isUndefinedOrNull(unreadCount[message.conversation])) {
        unreadCount[message.conversation] = 1;
      } else {
        unreadCount[message.conversation]++;
      }
    }
  });

  socket.on('message-old', function (message) {
    self.addLocally(message);
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

  $rootScope.$on('switched-to-conversation', function(event, conversation) {
    currentConversation = conversation;
    if (!currentConversation) {
      return;
    }
    unreadCount[currentConversation.id] = 0;
    /*
    var lastMessage =  getLastMessageFor(currentConversation);
    if (lastMessage) {
      readUntil[currentConversation.id] =
        lastMessage.id || lastMessage.clientId;
    } else {
      readUntil[currentConversation.id] = readLowVal;
    }
    */
  });
});
