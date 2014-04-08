'use strict';

var UserService = require('../service/user');
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

exports.getCssClasses = function(user, currentUser) {
  if (user.id === currentUser.id) {
    return cssClassesCurrent;
  } else if (user.online) {
    return cssClasses;
  } else {
    return cssClassesOffline;
  }
};

exports.getDisplayName = function(user) {
  if (user.online) {
    return user.nick;
  } else {
    return user.nick + ' (offline)';
  }
};
