(function() {
  'use strict';

  angular
    .module('plowderye')
    .service('SoundService',
      function (socket) {

    var soundEnabled = true;

    this.isSoundEnabled = function() {
      return soundEnabled;
    };

    this.toggleSoundEnabled = function() {
      soundEnabled = !soundEnabled;
      socket.emit('enable-sound', soundEnabled);
    };

    this.setSoundEnabled = function(enabled) {
      soundEnabled = enabled;
    };

    // TODO make this more angular-ish and less jquery-ish
    // Should live in a controller
    this.playSound = function(filename) {
      log.debug('playSound(' + filename + ')');
      log.debug('soundEnabled: ' + soundEnabled);
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
    };
  });

})();
