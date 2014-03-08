Chat = (function() {
  'use strict';

  function randomString()  {
    return ('' + Math.random()).substr(2, 4);
  }

  var Chat = function(socket) {
    this.socket = socket;
  };

  /*
  Chat.prototype.createMessage = function(text, nick, room) {
    var clientTime = Date.now();
    var message = {
      sender: nick,
      room: room,
      text: text,
      clientTime: clientTime,
      clientId: clientTime + '-' + randomString(),
    };
    return message;
  };
  */

  Chat.prototype.sendMessage = function(message) {
    this.socket.emit('message', message);
  };


  /*
  Chat.prototype.changeRoom = function(room) {
    this.socket.emit('join', {
      newRoom: room
    });
  };
  */

  Chat.prototype.processCommand = function(command) {
    var words = command.split(' ');
    var command = words[0]
                  .substring(1, words[0].length)
                  .toLowerCase();
    var message = false;

    switch(command) {
      case 'join':
        words.shift();
        var room = words.join(' ');
        //this.changeRoom(room);
        break;
      case 'nick':
        words.shift();
        var name = words.join(' ');
        this.socket.emit('set-name', name);
        break;
      default:
        message = 'Unrecognized command.';
        break;
    };

    return message;
  };

  return Chat;
})();
