'use strict';

module.exports = function ($scope, socket, UserService) {

  var cssClassesCurrent = ['sidebar-item-borders',
    'user-item',
    'user-item-skin',
    'sidebar-item-active'
  ];
  var cssClasses = ['sidebar-item-borders',
    'user-item',
    'user-item-skin'
  ];
  var cssClassesOffline = [
    'sidebar-item-borders',
    'user-item',
    'user-item-offline-skin'
  ];

  $scope.getUsers = UserService.getUsers;

  $scope.getCssClasses = function(user) {
    if (user.id === UserService.getUser().id) {
      return cssClassesCurrent;
    } else if (user.online) {
      return cssClasses;
    } else {
      return cssClassesOffline;
    }
  };

  $scope.getDisplayName = function(user) {
    if (user.online) {
      return user.nick;
    } else {
      return user.nick + ' (offline)';
    }
  };
};
