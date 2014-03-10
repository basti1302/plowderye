(function() {
  'use strict';

  $(document).ready(function() {
    $.cookie.defaults = {
      expires: 90,
      path: '/',
    };
    $('#message').focus();
  });

  angular.module('plowderye', ['btford.socket-io']);

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

  angular.module('plowderye').factory('socket', function (socketFactory) {
    return socketFactory();
  });

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

  angular
    .module('plowderye')
    .service('CommandService',
      function(socket, MessageService, ConversationService, UserService) {

    this.process = function(text) {
      if (text.charAt(0) === '/') {
        var systemMessageText = parse(text);
        if (systemMessageText) {
          MessageService.displaySystemMessage(systemMessageText);
        }
        return true;
      } else {
        return false;
      }
    }

    function parse(input) {
      var words = input.split(' ');
      var command = words[0]
                    .substring(1, words[0].length)
                    .toLowerCase();
      switch(command) {
        case 'join':
          words.shift();
          var conversationName = words.join(' ');
          ConversationService.join({ name: conversationName });
          return null;
        case 'nick':
          words.shift();
          var name = words.join(' ');
          UserService.changeName(name);
          return null;
        default:
          return 'Unrecognized command.';
      };
    };
  });

  angular
    .module('plowderye')
    .service('MessageService',
      function(socket, $rootScope, UserService, SoundService, NotificationService) {

    var self = this;
    var messages = [];
    var currentConversation = null;

    function createMessage(messageText) {
      var clientTime = Date.now();
      var conversationName = currentConversation ? currentConversation.name : null;
      return {
        sender: UserService.getUser(),
        room: conversationName,
        text: messageText,
        clientTime: clientTime,
        clientId: clientTime + '-' + randomString(),
        system: false,
      };
    }

    function createSystemMessage(messageText) {
      var clientTime = Date.now();
      return {
        sender: '::',
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
      if (message.sender) {
        message.formattedSender = message.sender;
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

    this.setCurrentConversation = function(_currentConversation) {
      currentConversation = _currentConversation;
    };

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
      format(message);
      messages.push(message);
    };

    socket.on('message', function (message) {
      self.addLocally(message);
      SoundService.playSound('ping');
      NotificationService.notify(message);
      // TODO Scroll to end? Keep current scrolling position??
    });

    $rootScope.$on('display-system-message', function(event, message) {
      self.displaySystemMessage(message);
    });
  });

  angular
    .module('plowderye')
    .service('UserService',
      function(socket, $rootScope, $interval) {

    var user = 'You';

    this.getUser = function() {
      return user;
    };

    this.changeName = function(name) {
      socket.emit('set-name', name);
    };

    socket.on('set-name-result', function(result) {
      var message;

      if (result.success) {
        user = result.name
        message = 'You are now known as ' + user + '.';
        $.cookie('nick', user);
      } else {
        message = result.message;
      }

      $rootScope.$emit('display-system-message', message);
    });

    // TODO This is nonsense. server knows all users and conversations and can
    // emit user lists on its own, without being polled.
    $interval(function() {
      socket.emit('fetch-users');
    }, 10000);
  });

  angular
    .module('plowderye')
    .service('SoundService',
      function (socket) {

    var soundEnabled = true;

    this.isSoundEnabled = function() {
      return soundEnabled;
    };

    this.toggleSoundEnabled = function() {
      soundEnabled = !soundEnabled;
      $.cookie('sound', soundEnabled);
    };

    // TODO make this more angular-ish and less jquery-ish
    // Should live in a controller
    this.playSound = function(filename) {
      $('#sound').empty();
      if (soundEnabled) {
        var mp3 = $('<source src="/sounds/' + filename +
          '.mp3" type="audio/mpeg" />');
        var ogg = $('<source src="/sounds/' + filename +
          '.ogg" type="audio/ogg" />');
        // fallback to embed (IE8 etc.)
        var embed = $('<embed hidden="true" autostart="true" loop="false" src="' +
              filename + '.mp3" />');
        var audio = $('<audio autoplay="autoplay"></audio>');
        audio.append(mp3);
        audio.append(ogg);
        audio.append(embed);
        $('#sound').append(audio);
      }
    };

    socket.on('set-sound-enabled', function(enabled) {
      soundEnabled = enabled;
    });
  });

  angular
    .module('plowderye')
    .service('NotificationService',
      function (socket) {

    var notificationsChecked = false;
    var notificationsEnabled = false;
    var notificationMessageCount = 0;
    var notificationMessage;
    var notificationTimeoutId;

    this.areNotificationsEnabled = function() {
      return notificationsEnabled;
    };

    this.toggleNotificationsEnabled = function() {
      notificationsEnabled = !notificationsEnabled;
      if (notificationsEnabled) {
        requestNotificationPermission();
      }
      $.cookie('notifications', notificationsEnabled);
    };

    this.notify = function(message) {
      notifyLater(message);
    };

    function notifyLater(message) {
      if (!notificationsEnabled) { return; }
      if (!notificationsChecked) {
        if (!notificationsEnabled) { return; }

        // TODO Does not work in Chrome because we are not in a onClick handler:
        // https://code.google.com/p/chromium/issues/detail?id=274284
        requestNotificationPermission();
        if (!notificationsEnabled) { return; }
      }
      // Overwrite current notificationMessage on purpose - only notify for
      // message received last in time period.
      notificationMessage = message;
      notificationMessageCount++;
      if (!notificationTimeoutId) {
        notificationTimeoutId = setTimeout(notifyNow, 3000);
      }
    }

    function requestNotificationPermission() {
      if (notificationsChecked) {
        return;
      }
      notificationsEnabled = notificationsEnabled &&
          Notify.prototype.isSupported();
      if (!notificationsEnabled) { return; }
      if (Notify.prototype.needsPermission()) {
        Notify.prototype.requestPermission();
      }
      notificationsChecked = true;
    }

    function notifyNow() {
      notificationTimeoutId = null;
      var title = 'New Message';
      if (notificationMessageCount >= 2) {
        title = notificationMessageCount + ' New Messages';
      }
      var notification = new Notify(title, {
        body: notificationMessage.sender + ': ' + notificationMessage.text,
      });
      notification.show();
      notificationMessageCount = 0;
    }

    socket.on('set-notifications-enabled', function(enabled) {
      notificationsEnabled = enabled;
    });
  });

  angular
    .module('plowderye')
    .controller('ConvListCtrl',
      function ($scope, ConversationService) {
    $scope.getConversations = ConversationService.getConversations;
    $scope.join = ConversationService.join;
 });

  angular
    .module('plowderye')
    .controller('HeadlineCtrl',
      function ($scope, ConversationService) {
    $scope.getCurrentConversationName = function() {
      var conv = ConversationService.getCurrentConversation();
      if (conv && conv.name) {
        return conv.name;
      } else {
        return '?';
      }
    };
  });

  angular
    .module('plowderye')
    .controller('ConfigCtrl',
      function ($scope, SoundService, NotificationService) {

    $scope.toggleNotifications = function() {
      NotificationService.toggleNotificationsEnabled();
    };

    $scope.getNotificationsImage = function() {
      if (NotificationService.areNotificationsEnabled()) {
        return 'notifications-enabled.png';
      } else {
        return 'notifications-disabled.png';
      }
    };

    $scope.getNotficationsTooltip = function() {
      if (NotificationService.areNotificationsEnabled()) {
        return 'currently showing desktop notifications - click to disable';
      } else {
        return 'currently not showing desktop notifications - click to enable';
      }
    };

    $scope.toggleSound = function() {
      SoundService.toggleSoundEnabled();
    };

    $scope.getSoundImage = function() {
      if (SoundService.isSoundEnabled()) {
        return 'sound-enabled.png';
      } else {
        return 'sound-disabled.png';
      }
    };
    $scope.getSoundTooltip = function() {
      if (SoundService.isSoundEnabled()) {
        return 'currently not muted - click to mute';
      } else {
        return 'currently muted - click to unmute';
      }
    };
  });

  angular
    .module('plowderye')
    .controller('MessageLogCtrl',
      function ($scope, MessageService) {
    $scope.getMessages = MessageService.getMessages;
  });

  angular
    .module('plowderye')
    .controller('SendMessageCtrl',
      function ($scope, MessageService, CommandService) {
    $scope.sendMessage = function() {
      if (!CommandService.process($scope.messageText)) {
        MessageService.send($scope.messageText);
      }
      $scope.messageText = null;
    }
  });

  angular
    .module('plowderye')
    .controller('UserListCtrl',
      function ($scope, socket) {
    socket.on('fetch-users-result', function(users) {
      $scope.users = users;
    });
  });

})();
