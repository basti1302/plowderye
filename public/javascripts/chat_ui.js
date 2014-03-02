(function() {
  'use strict';

  var nick = 'You';
  var room = 'Lobby';
  var soundEnabled = true;

  function divEscapedContentElement(message) {
    return $('<div></div>').text(message);
  }

  function divSystemContentElement(message) {
    return $('<div></div>').html('<i>' + message + '</i>');
  }

  function renderMessage(message) {
    var time;
    if (message.serverTime || message.clientTime) {
      var date = new Date(message.serverTime || message.clientTime);
      time =
      ' [' +
      date.toLocaleDateString() +
      ' - ' +
      date.toLocaleTimeString() +
      ']:'
      ;
    } else {
      time = ' [?]:';
    }

    var from;
    if (message.sender) {
      from = message.sender;
    } else {
      from += 'anonymous';
    }
    from += ': ';

    var text;
    if (message.text) {
      text = message.text;
    } else {
      text = '-no message-';
    }

    var timeDiv = $('<div class="message-time"></div>').text(time);
    $('#messages').append(timeDiv);
    var fromSpan = $('<span class="message-from"></span>').text(from);
    $('#messages').append(fromSpan);
    var messageSpan = $('<span class="message-text"></span>').text(text);
    $('#messages').append(messageSpan);
    var messageDiv = $('<div class="message"></div>').append(fromSpan).append(messageSpan);
    $('#messages').append(messageDiv);

    scrollToEnd();
  }


  function scrollToEnd() {
    $('#messages')
      .scrollTop($('#messages').prop('scrollHeight'));
  }

  function processUserInput(chatApp, socket) {
    var text = $('#send-message').val();
    var systemMessage;

    if (text.charAt(0) == '/') {
      systemMessage = chatApp.processCommand(text);
      if (systemMessage) {
        $('#messages').append(divSystemContentElement(systemMessage));
      }
    } else {
      var message = chatApp.createMessage(text, nick, room);
      chatApp.sendMessage(message);
      renderMessage(message);
      //$('#messages').append(divEscapedContentElement(message));
      scrollToEnd();
    }

    $('#send-message').val('');
  }

  var socket = io.connect();

  function playSound(filename){
    $('#sound').empty();
    if (soundEnabled) {
      var mp3 = $('<source src="/sounds/' + filename +
        '.mp3" type="audio/mpeg" />');
      var ogg = $('<source src="/sounds/' + filename +
        '.ogg" type="audio/ogg" />');
      // fallback to embed (IE8 etc.)
      var embed = $('<embed hidden="true" autostart="true" loop="false" src="' +
            filename + '.mp3" />');
      var audio = $('<audio autoplay="autoplay"></audio>');
      audio.append(mp3);
      audio.append(ogg);
      audio.append(embed);
      $('#sound').append(audio);
    }
  }

  $(document).ready(function() {
    var chatApp = new Chat(socket);

    $.cookie.defaults = {
      expires: 90,
      path: '/',
    };

    socket.on('nameResult', function(result) {
      var message;

      if (result.success) {
        message = 'You are now known as ' + result.name + '.';
        nick = result.name
        $.cookie('nick', nick);
      } else {
        message = result.message;
      }
      $('#messages').append(divSystemContentElement(message));
    });

    socket.on('joinResult', function(result) {
      room = result.room;
      $('#room').text(room);
      $('#messages')
        .empty()
        .append(divSystemContentElement('Room changed.'))
      ;
      $.cookie('room', room);
    });

    socket.on('setSoundEnabled', function(enabled) {
      soundEnabled = enabled;
      onSoundEnabledChange();
    });

    socket.on('message', function (message) {
      renderMessage(message);
      playSound('ping');
    });

    socket.on('rooms', function(rooms) {
      $('#room-list').empty();

      for(var room in rooms) {
        room = room.substring(1, room.length);
        if (room != '') {
          $('#room-list').append(divEscapedContentElement(room));
        }
      }

      $('#room-list div').click(function() {
        chatApp.processCommand('/join ' + $(this).text());
        $('#send-message').focus();
      });
    });

    $('#toggle-sound').click(function() {
      soundEnabled = !soundEnabled;
      onSoundEnabledChange();
    });

    function onSoundEnabledChange() {
      if (soundEnabled) {
        $('#toggle-sound')
          .attr('src', '/images/unmute.png')
          .attr('alt', 'currently not muted - click to mute')
        ;
      } else {
        $('#toggle-sound')
          .attr('src', '/images/mute.png')
          .attr('alt', 'currently muted - click to unmute')
        ;
      }
      $.cookie('sound', soundEnabled);
    }

    setInterval(function() {
      socket.emit('rooms');
    }, 1000);

    $('#send-message').focus();

    $('#send-form').submit(function() {
      processUserInput(chatApp, socket);
      return false;
    });
  });
})();
