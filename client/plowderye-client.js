'use strict';

var angular = require('angular');

require('angular-socket-io');
require('angular-animate');
require('angularjs-scroll-glue');

angular.module('plowderye', [
  'btford.socket-io',
  'ngAnimate',
  'luegg.directives',
])
  .constant('version', require('../package.json').version)

  .factory('socket', require('./factory/socket'))

  .service('ConversationService', require('./service/conversation'))
  .service('MessageService', require('./service/message'))
  .service('CommandService', require('./service/command'))
  .service('NotificationService', require('./service/notification'))
  .service('SoundService', require('./service/sound'))
  .service('UserService', require('./service/user'))

  .directive('focusOn', require('./directive/focus_on'))

  .controller('ConfigCtrl', require('./controller/config'))
  .controller('ConvListCtrl', require('./controller/conversation_list'))
  .controller('CreateConversationCtrl',
    require('./controller/create_conversation'))
  .controller('HeadlineCtrl', require('./controller/headline'))
  .controller('MessageLogCtrl', require('./controller/message_log'))
  .controller('SendMessageCtrl', require('./controller/send_message'))
  .controller('UserListCtrl', require('./controller/user_list'))
  ;

