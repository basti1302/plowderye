'use strict';

require('es5-shim');
require('es5-sham');

window.$ = window.jQuery = require('jquery');
require ('jquery-cookie');

var angular = require('angular');
require('angular-socket-io');
require('angular-animate');
require('angularjs-scroll-glue');

angular.module('plowderye', [
  'btford.socket-io',
  'ngAnimate',
  'luegg.directives',
]).constant('version', require('../package.json').version);

require('./factory/socket');

require('./service/conversation');
require('./service/message');
require('./service/command');
require('./service/notification');
require('./service/sound');
require('./service/user');

require('./directive/focus_on');

require('./controller/config');
require('./controller/user_conversation_list');
require('./controller/public_conversation_list');
require('./controller/create_conversation');
require('./controller/headline');
require('./controller/message_log');
require('./controller/send_message');
require('./controller/participant_list');
require('./controller/user_list');

require('./init');
