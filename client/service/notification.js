'use strict';

var logger = require('loglevel');

var angular = require('angular');

angular
  .module('plowderye')
  .service('NotificationService', function(socket, $rootScope) {

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
    socket.emit('enable-notifications', notificationsEnabled);
  };

  this.setNotificationsEnabled = function(enabled) {
    notificationsEnabled = enabled;
  };

  this.notify = function(message) {
    logger.debug('notfiy(' + JSON.stringify(message) +')');
    notifyLater(message);
  };

  function notifyLater(message) {
    logger.debug('notificationsEnabled: ' + notificationsEnabled);
    if (!notificationsEnabled) { return; }
    if (!notificationsChecked) {
      if (!notificationsEnabled) { return; }

      // Does not work in Chrome because we are not in a onClick handler:
      // https://code.google.com/p/chromium/issues/detail?id=274284
      // As a remedy we also ask for permission when the user activates
      // notifications.
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
        Notify.isSupported();
    if (!notificationsEnabled) { return; }
    if (Notify.needsPermission()) {
      Notify.requestPermission();
    }
    notificationsChecked = true;
  }

  function notifyNow() {
    notificationTimeoutId = null;
    var title;
    if (notificationMessage.conversationName) {
      title = 'New Message in ' + notificationMessage.conversationName;
    } else {
      title = 'New Message';
    }
    if (notificationMessageCount >= 2) {
      title = notificationMessageCount + ' New Messages';
    }
    var notification = new Notify(title, {
      body: notificationMessage.formattedSender +
        ': ' + notificationMessage.formattedText,
        // TODO icon for notification
        // icon: (string) - path for icon to display in notification
      tag: notificationMessage.clientId,
      timeout: 30,
      notifyClick: function() {
        $rootScope.$apply(function() {
          $rootScope.$emit('switch-to-conversation-by-id',
              notificationMessage.conversation);
        });
      },
    });
    notification.show();
    notificationMessageCount = 0;
  }
});
