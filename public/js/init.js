(function() {
  'use strict';

  $(document).ready(function() {
    $.cookie.defaults = {
      expires: 90,
      path: '/',
    };
    $('#message').focus();
  });

})();
