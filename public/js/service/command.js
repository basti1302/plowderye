(function() {
  'use strict';

  angular
    .module('plowderye')
    .service('CommandService',
      function(socket, MessageService, ConversationService, UserService) {

    this.process = function(text) {
      if (text.charAt(0) === '/') {
        parse(text);
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
      words.shift();
      var argument = words.join(' ');
      switch (command) {
        case 'join':
          ConversationService.join({ name: argument });
          break;
        case 'create':
          ConversationService.create(argument);
          break;
        case 'nick':
          UserService.changeName(argument);
          break;
        /*
        TODO Makes no sense unless a user can join multiple conversations!
        case 'add':
          ConversationService.addUserToConversation(argument);
          break;
        */
        default:
          MessageService.displaySystemMessage(systemMessageText);
          break;
      };
    };
  });

})();
