(function() {
  'use strict';

  angular.module('plowderye', []);

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

  angular.module('plowderye').controller('ConvListCtrl', function ($scope) {

    var lobby = new Conversation('Lobby', true);
    $scope.currentConversation = lobby;

    $scope.conversations = [
      lobby,
      new Conversation('Chat'),
      new Conversation('Plauderei'),
      new Conversation('Quatsch'),
    ];

    $scope.join = function(conversation) {
      // TODO Acutally join conversation via socket.io
      if ($scope.currentConversation) {
        $scope.currentConversation.active = false;
      }
      $scope.currentConversation = conversation;
      $scope.currentConversation.active = true;
    }
  });

  angular.module('plowderye').controller('HeadlineCtrl', function ($scope) {
    $scope.currentRoom = 'Lobby';
  });

  angular.module('plowderye').controller('ConfigCtrl', function ($scope) {

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
      // TODO Set cookie
      //$.cookie('notifications', notificationsEnabled);
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
      // TODO Set cookie
      $.cookie('sound', soundEnabled);
    };
  });

  angular.module('plowderye').controller('MessageLogCtrl', function ($scope) {
    $scope.messages = [{
      from: 'Alice',
      time: new Date().toLocaleDateString(),
      text: 'Hello Bob! :-)',
    },
    {
      from: 'Bob',
      time: new Date().toLocaleDateString(),
      text: 'Hello Alice. How are you today?',
    }];
  });

  angular.module('plowderye').controller('SendMessageCtrl', function ($scope) {
    $scope.sendMessage = function() {
      console.log($scope.message);
      $scope.message = null;
      // TODO Write message locally to message log via message service
      // TODO Send message via socket.io/message service
    }
  });



  angular.module('plowderye').controller('UserListCtrl', function ($scope) {
    $scope.users = [
      'Alice',
      'Bob',
    ];
  });
})();
