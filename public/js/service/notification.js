(function() {
  'use strict';

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
      socket.emit('enable-notifications', notificationsEnabled);
    };

    this.setNotificationsEnabled = function(enabled) {
      notificationsEnabled = enabled;
    };

    this.notify = function(message) {
      log.debug('notfiy(' + JSON.stringify(message) +')');
      notifyLater(message);
    };

    function notifyLater(message) {
      log.debug('notificationsEnabled: ' + notificationsEnabled);
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
  });

})();
