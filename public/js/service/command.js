(function() {
  'use strict';

  angular
    .module('plowderye')
    .service('CommandService',
      function(socket, MessageService, ConversationService, UserService) {

    this.process = function(text) {
      if (text.charAt(0) === '/') {
        var systemMessageText = parse(text);
        if (systemMessageText) {
          MessageService.displaySystemMessage(systemMessageText);
        }
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
      switch(command) {
        case 'join':
          words.shift();
          var conversationName = words.join(' ');
          ConversationService.join({ name: conversationName });
          return null;
        case 'nick':
          words.shift();
          var name = words.join(' ');
          UserService.changeName(name);
          return null;
        default:
          return 'Unrecognized command.';
      };
    };
  });

})();
