(function() {
  'use strict';

  log.setLevel(log.levels.DEBUG);
  //log.disableAll();

  $(document).ready(function() {
    $.cookie.defaults = {
      expires: 90,
      path: '/',
    };

    $(window).bind('focus', function() {
      $('#message').focus();
    });

    $('#message').focus();
  });

})();
