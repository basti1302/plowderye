'use strict';

var angular = require('angular');

angular
  .module('plowderye')
  .controller('ConfigCtrl', function(
  $scope,
  ConversationService,
  SoundService,
  NotificationService
) {

  $scope.leaveConversation =
    ConversationService.leave.bind(ConversationService);

  $scope.toggleNotifications =
    NotificationService.toggleNotificationsEnabled.bind(NotificationService);

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

  $scope.toggleSound = SoundService.toggleSoundEnabled.bind(SoundService);

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
