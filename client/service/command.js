'use strict';

var angular = require('angular');

angular
  .module('plowderye')
  .service('CommandService', function(
  socket,
  MessageService,
  ConversationService,
  UserService) {

  this.process = function(text) {
    if (text && text.charAt(0) === '/') {
      parse(text);
      return true;
    } else {
      return false;
    }
  };

  function parse(input) {
    var words = input.split(' ');
    var command = words[0]
                  .substring(1, words[0].length)
                  .toLowerCase();
    words.shift();
    var argument = words.join(' ');
    switch (command) {
      case 'join':
        ConversationService.joinOrSwitchTo(argument);
        break;
      case 'create':
        ConversationService.create(argument);
        break;
      case 'nick':
        UserService.changeName(argument);
        break;
      case 'leave':
        ConversationService.leave();
        break;
      case 'add':
        ConversationService.addUserToCurrentConversation(argument);
        break;
      default:
        MessageService.displaySystemMessageInCurrentConversation(
          'Unknown command: ' + command);
        break;
    }
  }
});
