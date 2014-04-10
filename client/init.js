'use strict';

var logger = require('loglevel');

//logger.setLevel(logger.levels.DEBUG);
logger.disableAll();

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
