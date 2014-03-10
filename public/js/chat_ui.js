(function() {
  'use strict';


  angular.module('plowderye', ['btford.socket-io', 'ngCookies']);

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
      function(MessageService, socket, $cookies) {

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
        $cookies.room = currentConversation.name;
        MessageService.displaySystemMessage('Room changed.');
        console.log('setting cookie: room: ' + $cookies.room);
      }
    });
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
      function(socket, $rootScope, UserService) {

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
      console.log('this.displaySystemMessage(' + messageText + ')');
      var message = createSystemMessage(messageText);
      this.addLocally(message);
    };

    this.addLocally = function(message) {
      format(message);
      console.log('adding locally: ');
      console.log(JSON.stringify(message, null, 2));
      messages.push(message);
    };

    socket.on('message', function (message) {
      self.addLocally(message);

      // TODO Play sound
      // TODO Show Desktop Notification
      // TODO Scroll to end? Keep current scrolling position??
    });

    $rootScope.$on('display-system-message', function(event, message) {
      console.log('$rootScope.on(\'display-system-message\'' + message + ')');
      self.displaySystemMessage(message);
    });
  });

  angular
    .module('plowderye')
    .service('UserService',
      function(socket, $rootScope, $cookies) {

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
        $cookies.nick = user;
      } else {
        message = result.message;
      }

      console.log('$rootScope.emit(display-system-message, ' + message);
      $rootScope.$emit('display-system-message', message);
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
      function ($scope, $cookies) {

    // TODO Enabled/Disabled states need to be variable in the corresponding
    // SoundService/NotificationService
    var notificationsEnabled = false;
    var soundEnabled = true;

    $scope.notificationsImage = 'notifications-disabled.png';
    $scope.notificationsTooltip ='currently not showing notifications - click to enable';
    $scope.soundImage = 'sound-enabled.png';
    $scope.soundTooltip = 'currently not muted - click to mute';

    $scope.toggleNotifications = function() {
      notificationsEnabled = !notificationsEnabled;
      if (notificationsEnabled) {
        $scope.notificationsImage = 'notifications-enabled.png';
        $scope.notificationsTooltip = 'currently showing notifications - click to disable';
      } else {
        $scope.notificationsImage = 'notifications-disabled.png';
        $scope.notificationsTooltip ='currently not showing notifications - click to enable';
      }
      $cookies.notifications = notificationsEnabled;
    };

    $scope.toggleSound = function() {
      soundEnabled = !soundEnabled;
      if (soundEnabled) {
        $scope.soundImage = 'sound-enabled.png';
        $scope.soundTooltip = 'currently not muted - click to mute';
      } else {
        $scope.soundImage = 'sound-disabled.png';
        $scope.soundTooltip = 'currently muted - click to unmute';
      }
      $cookies.sound = soundEnabled;
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
