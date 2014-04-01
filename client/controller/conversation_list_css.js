'use strict';

var cssClassesActive = [
  'sidebar-item-borders',
  'conv-item',
  'grad-ld',
  'sidebar-item-active'
];
var cssClassesInactive = [
  'sidebar-item-borders',
  'conv-item',
  'grad-ld'
];

module.exports = function(conversation) {
  if (conversation.active) {
    return cssClassesActive;
  } else {
    return cssClassesInactive;
  }
};
