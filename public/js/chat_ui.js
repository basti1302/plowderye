(function() {
  'use strict';

  angular.module('plowderye', []);

  angular.module('plowderye').controller('ConvListCtrl', function ($scope) {
    $scope.rooms = [
      { name: 'Lobby', cssClass: ['list-group-item', 'active'] },
      { name: 'Chat', cssClass: ['list-group-item'] },
      { name: 'Plauderei', cssClass: ['list-group-item'] },
      { name: 'Quatsch', cssClass: ['list-group-item'] },
    ];
  });

  angular.module('plowderye').controller('HeadlineCtrl', function ($scope) {
    $scope.currentRoom = 'Lobby';
  });

  angular.module('plowderye').controller('ConfigCtrl', function ($scope) {
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

  angular.module('plowderye').controller('UserListCtrl', function ($scope) {
    $scope.users = [
      'Alice',
      'Bob',
    ];
  });
})();
