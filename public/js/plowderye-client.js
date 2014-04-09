(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = function (
  $scope,
  ConversationService,
  SoundService,
  NotificationService) {

  $scope.leaveConversation = function() {
    ConversationService.leave();
  };

  $scope.toggleNotifications = function() {
    NotificationService.toggleNotificationsEnabled();
  };

  $scope.getNotificationsImage = function() {
    if (NotificationService.areNotificationsEnabled()) {
      return 'notifications-enabled.png';
    } else {
      return 'notifications-disabled.png';
    }
  };

  $scope.getNotficationsTooltip = function() {
    if (NotificationService.areNotificationsEnabled()) {
      return 'currently showing desktop notifications - click to disable';
    } else {
      return 'currently not showing desktop notifications - click to enable';
    }
  };

  $scope.toggleSound = function() {
    SoundService.toggleSoundEnabled();
  };

  $scope.getSoundImage = function() {
    if (SoundService.isSoundEnabled()) {
      return 'sound-enabled.png';
    } else {
      return 'sound-disabled.png';
    }
  };
  $scope.getSoundTooltip = function() {
    if (SoundService.isSoundEnabled()) {
      return 'currently not muted - click to mute';
    } else {
      return 'currently muted - click to unmute';
    }
  };
};

},{}],2:[function(require,module,exports){
'use strict';

var cssClassesActive = [
  'sidebar-item-borders',
  'conv-item',
  'grad-ld',
  'sidebar-item-active'
];
var cssClassesInactive = [
  'sidebar-item-borders',
  'conv-item',
  'grad-ld'
];

module.exports = function(conversation) {
  if (conversation.active) {
    return cssClassesActive;
  } else {
    return cssClassesInactive;
  }
};

},{}],3:[function(require,module,exports){
'use strict';

module.exports = function(
  $scope,
  $timeout,
  ConversationService) {

  hide();

  $scope.toggle = function() {
    $scope.formVisible = !$scope.formVisible;
    $scope.focusInput = $scope.formVisible;
    $scope.inputHasFocus = $scope.focusInput;
    $('#create-conversation-div').removeClass('initially-invisible');
  };

  $scope.onLeave = function() {
    $timeout(function() {
      if (!$scope.buttonHasFocus && !$scope.inputHasFocus) {
        hide();
      }
    }, 100);
  };

  $scope.createConversation = function() {
    if ($scope.conversationName) {
      ConversationService.create($scope.conversationName);
      $scope.conversationName = null;
    }
    $timeout(hide, 100);
  };

  function hide() {
    $scope.formVisible = false;
    $scope.focusInput = false;
    $scope.inputHasFocus = false;
    $scope.buttonHasFocus = false;
  }
};

},{}],4:[function(require,module,exports){
'use strict';

module.exports = function ($scope, ConversationService) {
  $scope.getCurrentConversationName = function() {
    var conv = ConversationService.getCurrentConversation();
    if (conv && conv.name) {
      return conv.name;
    } else {
      return '?';
    }
  };
};

},{}],5:[function(require,module,exports){
'use strict';

module.exports = function ($scope, MessageService) {
  $scope.glued = true;
  $scope.getMessages = MessageService.getMessages;
};

},{}],6:[function(require,module,exports){
'use strict';

var userListStyle = require('./user_list_style');

module.exports = function ($scope, socket, ConversationService, UserService) {

  $scope.getParticipants = function() {
    return UserService.getParticipants(
      ConversationService.getCurrentConversation());
  };

  $scope.getCssClasses = function(user) {
    return userListStyle.getCssClasses(user, UserService.getUser());
  };

  $scope.getDisplayName = userListStyle.getDisplayName;
};

},{"./user_list_style":11}],7:[function(require,module,exports){
'use strict';

var getCssClasses = require('./conversation_list_style');

module.exports = function ($scope, ConversationService) {

  $scope.getPublicConversations = ConversationService.getPublicConversations;

  $scope.join = ConversationService.join;

  $scope.getCssClasses = getCssClasses;

};

},{"./conversation_list_style":2}],8:[function(require,module,exports){
'use strict';

module.exports = function ($scope, MessageService, CommandService) {

  $scope.sendMessage = function() {
    var text = $scope.messageText;
    $scope.messageText = null;
    if (!text || text.trim().length === 0) {
      return;
    }

    if (!CommandService.process(text)) {
      MessageService.send(text);
    }
  };
};

},{}],9:[function(require,module,exports){
'use strict';

var getCssClasses = require('./conversation_list_style');

module.exports = function ($scope, ConversationService) {

  $scope.getUserConversations = ConversationService.getUserConversations;

  $scope.switchTo = ConversationService.switchTo;

  $scope.getCssClasses = getCssClasses;
};

},{"./conversation_list_style":2}],10:[function(require,module,exports){
'use strict';

var userListStyle = require('./user_list_style');

module.exports = function ($scope, socket, UserService) {
  $scope.getAllUsers = UserService.getAllUsers;

  $scope.getCssClasses = function(user) {
    return userListStyle.getCssClasses(user, UserService.getUser());
  };

  $scope.getDisplayName = userListStyle.getDisplayName;
};

},{"./user_list_style":11}],11:[function(require,module,exports){
'use strict';

var UserService = require('../service/user');
var cssClassesCurrent = ['sidebar-item-borders',
  'user-item',
  'user-item-skin',
  'sidebar-item-active'
];
var cssClasses = ['sidebar-item-borders',
  'user-item',
  'user-item-skin'
];
var cssClassesOffline = [
  'sidebar-item-borders',
  'user-item',
  'user-item-offline-skin'
];

exports.getCssClasses = function(user, currentUser) {
  if (user.id === currentUser.id) {
    return cssClassesCurrent;
  } else if (user.online) {
    return cssClasses;
  } else {
    return cssClassesOffline;
  }
};

exports.getDisplayName = function(user) {
  if (user.online) {
    return user.nick;
  } else {
    return user.nick + ' (offline)';
  }
};

},{"../service/user":108}],12:[function(require,module,exports){
'use strict';

/*
 * Set focus to the element this directive is declared upon when the given
 * expression evaluates to true.
 */
module.exports = function($timeout) {
  return {
    link: function(scope, element, attrs) {
      scope.$watch(attrs.focusOn, function(value) {
        if(value === true) {
          $timeout(function() {
            element[0].focus();
            scope[attrs.focusOn] = false;
          });
        }
      });
    }
  };
};

},{}],13:[function(require,module,exports){
'use strict';

module.exports = function(socketFactory) {
  return socketFactory();
};

},{}],14:[function(require,module,exports){
/*
 AngularJS v1.2.12
 (c) 2010-2014 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(v,k,t){'use strict';k.module("ngAnimate",["ng"]).factory("$$animateReflow",["$window","$timeout",function(k,B){var d=k.requestAnimationFrame||k.webkitRequestAnimationFrame||function(d){return B(d,10,!1)},q=k.cancelAnimationFrame||k.webkitCancelAnimationFrame||function(d){return B.cancel(d)};return function(p){var k=d(p);return function(){q(k)}}}]).config(["$provide","$animateProvider",function(R,B){function d(d){for(var k=0;k<d.length;k++){var p=d[k];if(p.nodeType==X)return p}}var q=k.noop,
p=k.forEach,$=B.$$selectors,X=1,l="$$ngAnimateState",K="ng-animate",m={running:!0};R.decorator("$animate",["$delegate","$injector","$sniffer","$rootElement","$timeout","$rootScope","$document",function(C,v,t,H,y,w,N){function I(a){if(a){var g=[],e={};a=a.substr(1).split(".");(t.transitions||t.animations)&&a.push("");for(var c=0;c<a.length;c++){var f=a[c],d=$[f];d&&!e[f]&&(g.push(v.get(d)),e[f]=!0)}return g}}function r(a,g,e,c,f,k,m){function t(a){n();if(!0===a)z();else{if(a=e.data(l))a.done=z,e.data(l,
a);C(D,"after",z)}}function C(c,d,f){"after"==d?r():E();var k=d+"End";p(c,function(b,aa){var h=function(){a:{var b=d+"Complete",a=c[aa];a[b]=!0;(a[k]||q)();for(a=0;a<c.length;a++)if(!c[a][b])break a;f()}};"before"!=d||"enter"!=a&&"move"!=a?b[d]?b[k]=u?b[d](e,g,h):b[d](e,h):h():h()})}function w(c){e.triggerHandler("$animate:"+c,{event:a,className:g})}function E(){y(function(){w("before")},0,!1)}function r(){y(function(){w("after")},0,!1)}function v(){y(function(){w("close");m&&m()},0,!1)}function n(){n.hasBeenRun||
(n.hasBeenRun=!0,k())}function z(){if(!z.hasBeenRun){z.hasBeenRun=!0;var a=e.data(l);a&&(u?A(e):(a.closeAnimationTimeout=y(function(){A(e)},0,!1),e.data(l,a)));v()}}var s,x,G=d(e);G&&(s=G.className,x=s+" "+g);if(G&&L(x)){x=(" "+x).replace(/\s+/g,".");c||(c=f?f.parent():e.parent());x=I(x);var u="addClass"==a||"removeClass"==a;f=e.data(l)||{};if(ba(e,c)||0===x.length)n(),E(),r(),z();else{var D=[];u&&(f.disabled||f.running&&f.structural)||p(x,function(c){if(!c.allowCancel||c.allowCancel(e,a,g)){var d=
c[a];"leave"==a?(c=d,d=null):c=c["before"+a.charAt(0).toUpperCase()+a.substr(1)];D.push({before:c,after:d})}});0===D.length?(n(),E(),r(),v()):(c=" "+s+" ",f.running&&(y.cancel(f.closeAnimationTimeout),A(e),J(f.animations),x=(s=u&&!f.structural)&&f.className==g&&a!=f.event,f.beforeComplete||x?(f.done||q)(!0):s&&(c="removeClass"==f.event?c.replace(" "+f.className+" "," "):c+f.className+" ")),s=" "+g+" ","addClass"==a&&0<=c.indexOf(s)||"removeClass"==a&&-1==c.indexOf(s)?(n(),E(),r(),v()):(e.addClass(K),
e.data(l,{running:!0,event:a,className:g,structural:!u,animations:D,done:t}),C(D,"before",t)))}}else n(),E(),r(),z()}function Q(a){a=d(a);p(a.querySelectorAll("."+K),function(a){a=k.element(a);var e=a.data(l);e&&(J(e.animations),A(a))})}function J(a){p(a,function(a){a.beforeComplete||(a.beforeEnd||q)(!0);a.afterComplete||(a.afterEnd||q)(!0)})}function A(a){d(a)==d(H)?m.disabled||(m.running=!1,m.structural=!1):(a.removeClass(K),a.removeData(l))}function ba(a,g){if(m.disabled)return!0;if(d(a)==d(H))return m.disabled||
m.running;do{if(0===g.length)break;var e=d(g)==d(H),c=e?m:g.data(l),c=c&&(!!c.disabled||!!c.running);if(e||c)return c;if(e)break}while(g=g.parent());return!0}H.data(l,m);w.$$postDigest(function(){w.$$postDigest(function(){m.running=!1})});var M=B.classNameFilter(),L=M?function(a){return M.test(a)}:function(){return!0};return{enter:function(a,d,e,c){this.enabled(!1,a);C.enter(a,d,e);w.$$postDigest(function(){r("enter","ng-enter",a,d,e,q,c)})},leave:function(a,d){Q(a);this.enabled(!1,a);w.$$postDigest(function(){r("leave",
"ng-leave",a,null,null,function(){C.leave(a)},d)})},move:function(a,d,e,c){Q(a);this.enabled(!1,a);C.move(a,d,e);w.$$postDigest(function(){r("move","ng-move",a,d,e,q,c)})},addClass:function(a,d,e){r("addClass",d,a,null,null,function(){C.addClass(a,d)},e)},removeClass:function(a,d,e){r("removeClass",d,a,null,null,function(){C.removeClass(a,d)},e)},enabled:function(a,d){switch(arguments.length){case 2:if(a)A(d);else{var e=d.data(l)||{};e.disabled=!0;d.data(l,e)}break;case 1:m.disabled=!a;break;default:a=
!m.disabled}return!!a}}}]);B.register("",["$window","$sniffer","$timeout","$$animateReflow",function(m,l,B,H){function y(b,a){O&&O();U.push(a);var h=d(b);b=k.element(h);V.push(b);var h=b.data(n),c=h.stagger,c=h.itemIndex*(Math.max(c.animationDelay,c.transitionDelay)||0);P=Math.max(P,(c+(h.maxDelay+h.maxDuration)*s)*x);h.animationCount=G;O=H(function(){p(U,function(b){b()});var b=[],a=G;p(V,function(a){b.push(a)});B(function(){w(b,a);b=null},P,!1);U=[];V=[];O=null;u={};P=0;G++})}function w(b,a){p(b,
function(b){(b=b.data(n))&&b.animationCount==a&&(b.closeAnimationFn||q)()})}function N(b,a){var h=a?u[a]:null;if(!h){var d=0,c=0,e=0,k=0,g,n,l,r;p(b,function(b){if(b.nodeType==X){b=m.getComputedStyle(b)||{};l=b[f+Y];d=Math.max(I(l),d);r=b[f+W];g=b[f+E];c=Math.max(I(g),c);n=b[F+E];k=Math.max(I(n),k);var a=I(b[F+Y]);0<a&&(a*=parseInt(b[F+R],10)||1);e=Math.max(a,e)}});h={total:0,transitionPropertyStyle:r,transitionDurationStyle:l,transitionDelayStyle:g,transitionDelay:c,transitionDuration:d,animationDelayStyle:n,
animationDelay:k,animationDuration:e};a&&(u[a]=h)}return h}function I(b){var a=0;b=k.isString(b)?b.split(/\s*,\s*/):[];p(b,function(b){a=Math.max(parseFloat(b)||0,a)});return a}function r(b){var a=b.parent(),h=a.data(Z);h||(a.data(Z,++D),h=D);return h+"-"+d(b).className}function Q(b,a,h){var c=r(b),e=c+" "+a,k={},g=u[e]?++u[e].total:0;if(0<g){var l=a+"-stagger",k=c+" "+l;(c=!u[k])&&b.addClass(l);k=N(b,k);c&&b.removeClass(l)}h=h||function(b){return b()};b.addClass(a);h=h(function(){return N(b,e)});
l=Math.max(h.transitionDelay,h.animationDelay);c=Math.max(h.transitionDuration,h.animationDuration);if(0===c)return b.removeClass(a),!1;var m="";0<h.transitionDuration?d(b).style[f+W]="none":d(b).style[F]="none 0s";p(a.split(" "),function(b,a){m+=(0<a?" ":"")+b+"-active"});b.data(n,{className:a,activeClassName:m,maxDuration:c,maxDelay:l,classes:a+" "+m,timings:h,stagger:k,itemIndex:g});return!0}function J(b){var a=f+W;b=d(b);b.style[a]&&0<b.style[a].length&&(b.style[a]="")}function A(b){var a=F;b=
d(b);b.style[a]&&0<b.style[a].length&&(b.style[a]="")}function K(b,a,h){function e(c){b.off(v,k);b.removeClass(r);c=b;c.removeClass(a);c.removeData(n);c=d(b);for(var h in s)c.style.removeProperty(s[h])}function k(b){b.stopPropagation();var a=b.originalEvent||b;b=a.$manualTimeStamp||a.timeStamp||Date.now();a=parseFloat(a.elapsedTime.toFixed(z));Math.max(b-w,0)>=u&&a>=p&&h()}var f=b.data(n),g=d(b);if(-1!=g.className.indexOf(a)&&f){var l=f.timings,m=f.stagger,p=f.maxDuration,r=f.activeClassName,u=Math.max(l.transitionDelay,
l.animationDelay)*x,w=Date.now(),v=T+" "+S,t=f.itemIndex,q="",s=[];if(0<l.transitionDuration){var y=l.transitionPropertyStyle;-1==y.indexOf("all")&&(q+=c+"transition-property: "+y+";",q+=c+"transition-duration: "+l.transitionDurationStyle+";",s.push(c+"transition-property"),s.push(c+"transition-duration"))}0<t&&(0<m.transitionDelay&&0===m.transitionDuration&&(q+=c+"transition-delay: "+M(l.transitionDelayStyle,m.transitionDelay,t)+"; ",s.push(c+"transition-delay")),0<m.animationDelay&&0===m.animationDuration&&
(q+=c+"animation-delay: "+M(l.animationDelayStyle,m.animationDelay,t)+"; ",s.push(c+"animation-delay")));0<s.length&&(l=g.getAttribute("style")||"",g.setAttribute("style",l+" "+q));b.on(v,k);b.addClass(r);f.closeAnimationFn=function(){e();h()};return e}h()}function M(b,a,c){var d="";p(b.split(","),function(b,e){d+=(0<e?",":"")+(c*a+parseInt(b,10))+"s"});return d}function L(b,a,c){if(Q(b,a,c))return function(c){c&&(b.removeClass(a),b.removeData(n))}}function a(a,c,d){if(a.data(n))return K(a,c,d);a.removeClass(c);
a.removeData(n);d()}function g(b,c,d){var e=L(b,c);if(e){var f=e;y(b,function(){J(b);A(b);f=a(b,c,d)});return function(a){(f||q)(a)}}d()}function e(a,c){var d="";a=k.isArray(a)?a:a.split(/\s+/);p(a,function(a,b){a&&0<a.length&&(d+=(0<b?" ":"")+a+c)});return d}var c="",f,S,F,T;v.ontransitionend===t&&v.onwebkittransitionend!==t?(c="-webkit-",f="WebkitTransition",S="webkitTransitionEnd transitionend"):(f="transition",S="transitionend");v.onanimationend===t&&v.onwebkitanimationend!==t?(c="-webkit-",F=
"WebkitAnimation",T="webkitAnimationEnd animationend"):(F="animation",T="animationend");var Y="Duration",W="Property",E="Delay",R="IterationCount",Z="$$ngAnimateKey",n="$$ngAnimateCSS3Data",z=3,s=1.5,x=1E3,G=0,u={},D=0,U=[],V=[],O,P=0;return{allowCancel:function(a,c,h){var f=(a.data(n)||{}).classes;if(!f||0<=["enter","leave","move"].indexOf(c))return!0;var l=a.parent(),g=k.element(d(a).cloneNode());g.attr("style","position:absolute; top:-9999px; left:-9999px");g.removeAttr("id");g.empty();p(f.split(" "),
function(a){g.removeClass(a)});g.addClass(e(h,"addClass"==c?"-add":"-remove"));l.append(g);a=N(g);g.remove();return 0<Math.max(a.transitionDuration,a.animationDuration)},enter:function(a,c){return g(a,"ng-enter",c)},leave:function(a,c){return g(a,"ng-leave",c)},move:function(a,c){return g(a,"ng-move",c)},beforeAddClass:function(a,c,d){var f=L(a,e(c,"-add"),function(d){a.addClass(c);d=d();a.removeClass(c);return d});if(f)return y(a,function(){J(a);A(a);d()}),f;d()},addClass:function(b,c,d){return a(b,
e(c,"-add"),d)},beforeRemoveClass:function(a,c,d){var f=L(a,e(c,"-remove"),function(d){var e=a.attr("class");a.removeClass(c);d=d();a.attr("class",e);return d});if(f)return y(a,function(){J(a);A(a);d()}),f;d()},removeClass:function(b,c,d){return a(b,e(c,"-remove"),d)}}}])}])})(window,window.angular);
//# sourceMappingURL=angular-animate.min.js.map
},{}],15:[function(require,module,exports){
/*
 * @license
 * angular-socket-io v0.4.1
 * (c) 2014 Brian Ford http://briantford.com
 * License: MIT
 */

'use strict';

angular.module('btford.socket-io', []).
  provider('socketFactory', function () {

    // when forwarding events, prefix the event name
    var defaultPrefix = 'socket:',
      ioSocket;

    // expose to provider
    this.$get = function ($rootScope, $timeout) {

      var asyncAngularify = function (socket, callback) {
        return callback ? function () {
          var args = arguments;
          $timeout(function () {
            callback.apply(socket, args);
          }, 0);
        } : angular.noop;
      };

      return function socketFactory (options) {
        options = options || {};
        var socket = options.ioSocket || io.connect();
        var prefix = options.prefix || defaultPrefix;
        var defaultScope = options.scope || $rootScope;

        var addListener = function (eventName, callback) {
          socket.on(eventName, callback.__ng = asyncAngularify(socket, callback));
        };

        var wrappedSocket = {
          on: addListener,
          addListener: addListener,

          emit: function (eventName, data, callback) {
            var lastIndex = arguments.length - 1;
            var callback = arguments[lastIndex];
            if(typeof callback == 'function') {
              callback = asyncAngularify(socket, callback);
              arguments[lastIndex] = callback;
            }
            return socket.emit.apply(socket, arguments);
          },

          removeListener: function (ev, fn) {
            if (fn && fn.__ng) {
              arguments[1] = fn.__ng;
            }
            return socket.removeListener.apply(socket, arguments);
          },

          // when socket.on('someEvent', fn (data) { ... }),
          // call scope.$broadcast('someEvent', data)
          forward: function (events, scope) {
            if (events instanceof Array === false) {
              events = [events];
            }
            if (!scope) {
              scope = defaultScope;
            }
            events.forEach(function (eventName) {
              var prefixedEvent = prefix + eventName;
              var forwardBroadcast = asyncAngularify(socket, function (data) {
                scope.$broadcast(prefixedEvent, data);
              });
              scope.$on('$destroy', function () {
                socket.removeListener(eventName, forwardBroadcast);
              });
              socket.on(eventName, forwardBroadcast);
            });
          }
        };

        return wrappedSocket;
      };
    };
  });

},{}],16:[function(require,module,exports){
require('./lib/angular.min.js');

module.exports = angular;

},{"./lib/angular.min.js":17}],17:[function(require,module,exports){
/*
 AngularJS v1.2.13
 (c) 2010-2014 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(C,T,s){'use strict';function E(b){return function(){var a=arguments[0],c,a="["+(b?b+":":"")+a+"] http://errors.angularjs.org/1.2.13/"+(b?b+"/":"")+a;for(c=1;c<arguments.length;c++)a=a+(1==c?"?":"&")+"p"+(c-1)+"="+encodeURIComponent("function"==typeof arguments[c]?arguments[c].toString().replace(/ \{[\s\S]*$/,""):"undefined"==typeof arguments[c]?"undefined":"string"!=typeof arguments[c]?JSON.stringify(arguments[c]):arguments[c]);return Error(a)}}function vb(b){if(null==b||za(b))return!1;
var a=b.length;return 1===b.nodeType&&a?!0:D(b)||H(b)||0===a||"number"===typeof a&&0<a&&a-1 in b}function r(b,a,c){var d;if(b)if(N(b))for(d in b)"prototype"==d||("length"==d||"name"==d||b.hasOwnProperty&&!b.hasOwnProperty(d))||a.call(c,b[d],d);else if(b.forEach&&b.forEach!==r)b.forEach(a,c);else if(vb(b))for(d=0;d<b.length;d++)a.call(c,b[d],d);else for(d in b)b.hasOwnProperty(d)&&a.call(c,b[d],d);return b}function Qb(b){var a=[],c;for(c in b)b.hasOwnProperty(c)&&a.push(c);return a.sort()}function Qc(b,
a,c){for(var d=Qb(b),e=0;e<d.length;e++)a.call(c,b[d[e]],d[e]);return d}function Rb(b){return function(a,c){b(c,a)}}function $a(){for(var b=ja.length,a;b;){b--;a=ja[b].charCodeAt(0);if(57==a)return ja[b]="A",ja.join("");if(90==a)ja[b]="0";else return ja[b]=String.fromCharCode(a+1),ja.join("")}ja.unshift("0");return ja.join("")}function Sb(b,a){a?b.$$hashKey=a:delete b.$$hashKey}function t(b){var a=b.$$hashKey;r(arguments,function(a){a!==b&&r(a,function(a,c){b[c]=a})});Sb(b,a);return b}function Q(b){return parseInt(b,
10)}function Tb(b,a){return t(new (t(function(){},{prototype:b})),a)}function w(){}function Aa(b){return b}function aa(b){return function(){return b}}function x(b){return"undefined"===typeof b}function v(b){return"undefined"!==typeof b}function Z(b){return null!=b&&"object"===typeof b}function D(b){return"string"===typeof b}function wb(b){return"number"===typeof b}function La(b){return"[object Date]"===Ma.call(b)}function H(b){return"[object Array]"===Ma.call(b)}function N(b){return"function"===typeof b}
function ab(b){return"[object RegExp]"===Ma.call(b)}function za(b){return b&&b.document&&b.location&&b.alert&&b.setInterval}function Rc(b){return!(!b||!(b.nodeName||b.on&&b.find))}function Sc(b,a,c){var d=[];r(b,function(b,f,g){d.push(a.call(c,b,f,g))});return d}function bb(b,a){if(b.indexOf)return b.indexOf(a);for(var c=0;c<b.length;c++)if(a===b[c])return c;return-1}function Na(b,a){var c=bb(b,a);0<=c&&b.splice(c,1);return a}function ca(b,a){if(za(b)||b&&b.$evalAsync&&b.$watch)throw Oa("cpws");if(a){if(b===
a)throw Oa("cpi");if(H(b))for(var c=a.length=0;c<b.length;c++)a.push(ca(b[c]));else{c=a.$$hashKey;r(a,function(b,c){delete a[c]});for(var d in b)a[d]=ca(b[d]);Sb(a,c)}}else(a=b)&&(H(b)?a=ca(b,[]):La(b)?a=new Date(b.getTime()):ab(b)?a=RegExp(b.source):Z(b)&&(a=ca(b,{})));return a}function Ub(b,a){a=a||{};for(var c in b)!b.hasOwnProperty(c)||"$"===c.charAt(0)&&"$"===c.charAt(1)||(a[c]=b[c]);return a}function ta(b,a){if(b===a)return!0;if(null===b||null===a)return!1;if(b!==b&&a!==a)return!0;var c=typeof b,
d;if(c==typeof a&&"object"==c)if(H(b)){if(!H(a))return!1;if((c=b.length)==a.length){for(d=0;d<c;d++)if(!ta(b[d],a[d]))return!1;return!0}}else{if(La(b))return La(a)&&b.getTime()==a.getTime();if(ab(b)&&ab(a))return b.toString()==a.toString();if(b&&b.$evalAsync&&b.$watch||a&&a.$evalAsync&&a.$watch||za(b)||za(a)||H(a))return!1;c={};for(d in b)if("$"!==d.charAt(0)&&!N(b[d])){if(!ta(b[d],a[d]))return!1;c[d]=!0}for(d in a)if(!c.hasOwnProperty(d)&&"$"!==d.charAt(0)&&a[d]!==s&&!N(a[d]))return!1;return!0}return!1}
function Vb(){return T.securityPolicy&&T.securityPolicy.isActive||T.querySelector&&!(!T.querySelector("[ng-csp]")&&!T.querySelector("[data-ng-csp]"))}function cb(b,a){var c=2<arguments.length?ua.call(arguments,2):[];return!N(a)||a instanceof RegExp?a:c.length?function(){return arguments.length?a.apply(b,c.concat(ua.call(arguments,0))):a.apply(b,c)}:function(){return arguments.length?a.apply(b,arguments):a.call(b)}}function Tc(b,a){var c=a;"string"===typeof b&&"$"===b.charAt(0)?c=s:za(a)?c="$WINDOW":
a&&T===a?c="$DOCUMENT":a&&(a.$evalAsync&&a.$watch)&&(c="$SCOPE");return c}function oa(b,a){return"undefined"===typeof b?s:JSON.stringify(b,Tc,a?"  ":null)}function Wb(b){return D(b)?JSON.parse(b):b}function Pa(b){"function"===typeof b?b=!0:b&&0!==b.length?(b=O(""+b),b=!("f"==b||"0"==b||"false"==b||"no"==b||"n"==b||"[]"==b)):b=!1;return b}function ga(b){b=z(b).clone();try{b.empty()}catch(a){}var c=z("<div>").append(b).html();try{return 3===b[0].nodeType?O(c):c.match(/^(<[^>]+>)/)[1].replace(/^<([\w\-]+)/,
function(a,b){return"<"+O(b)})}catch(d){return O(c)}}function Xb(b){try{return decodeURIComponent(b)}catch(a){}}function Yb(b){var a={},c,d;r((b||"").split("&"),function(b){b&&(c=b.split("="),d=Xb(c[0]),v(d)&&(b=v(c[1])?Xb(c[1]):!0,a[d]?H(a[d])?a[d].push(b):a[d]=[a[d],b]:a[d]=b))});return a}function Zb(b){var a=[];r(b,function(b,d){H(b)?r(b,function(b){a.push(va(d,!0)+(!0===b?"":"="+va(b,!0)))}):a.push(va(d,!0)+(!0===b?"":"="+va(b,!0)))});return a.length?a.join("&"):""}function xb(b){return va(b,
!0).replace(/%26/gi,"&").replace(/%3D/gi,"=").replace(/%2B/gi,"+")}function va(b,a){return encodeURIComponent(b).replace(/%40/gi,"@").replace(/%3A/gi,":").replace(/%24/g,"$").replace(/%2C/gi,",").replace(/%20/g,a?"%20":"+")}function Uc(b,a){function c(a){a&&d.push(a)}var d=[b],e,f,g=["ng:app","ng-app","x-ng-app","data-ng-app"],h=/\sng[:\-]app(:\s*([\w\d_]+);?)?\s/;r(g,function(a){g[a]=!0;c(T.getElementById(a));a=a.replace(":","\\:");b.querySelectorAll&&(r(b.querySelectorAll("."+a),c),r(b.querySelectorAll("."+
a+"\\:"),c),r(b.querySelectorAll("["+a+"]"),c))});r(d,function(a){if(!e){var b=h.exec(" "+a.className+" ");b?(e=a,f=(b[2]||"").replace(/\s+/g,",")):r(a.attributes,function(b){!e&&g[b.name]&&(e=a,f=b.value)})}});e&&a(e,f?[f]:[])}function $b(b,a){var c=function(){b=z(b);if(b.injector()){var c=b[0]===T?"document":ga(b);throw Oa("btstrpd",c);}a=a||[];a.unshift(["$provide",function(a){a.value("$rootElement",b)}]);a.unshift("ng");c=ac(a);c.invoke(["$rootScope","$rootElement","$compile","$injector","$animate",
function(a,b,c,d,e){a.$apply(function(){b.data("$injector",d);c(b)(a)})}]);return c},d=/^NG_DEFER_BOOTSTRAP!/;if(C&&!d.test(C.name))return c();C.name=C.name.replace(d,"");Ba.resumeBootstrap=function(b){r(b,function(b){a.push(b)});c()}}function db(b,a){a=a||"_";return b.replace(Vc,function(b,d){return(d?a:"")+b.toLowerCase()})}function yb(b,a,c){if(!b)throw Oa("areq",a||"?",c||"required");return b}function Qa(b,a,c){c&&H(b)&&(b=b[b.length-1]);yb(N(b),a,"not a function, got "+(b&&"object"==typeof b?
b.constructor.name||"Object":typeof b));return b}function wa(b,a){if("hasOwnProperty"===b)throw Oa("badname",a);}function bc(b,a,c){if(!a)return b;a=a.split(".");for(var d,e=b,f=a.length,g=0;g<f;g++)d=a[g],b&&(b=(e=b)[d]);return!c&&N(b)?cb(e,b):b}function zb(b){var a=b[0];b=b[b.length-1];if(a===b)return z(a);var c=[a];do{a=a.nextSibling;if(!a)break;c.push(a)}while(a!==b);return z(c)}function Wc(b){var a=E("$injector"),c=E("ng");b=b.angular||(b.angular={});b.$$minErr=b.$$minErr||E;return b.module||
(b.module=function(){var b={};return function(e,f,g){if("hasOwnProperty"===e)throw c("badname","module");f&&b.hasOwnProperty(e)&&(b[e]=null);return b[e]||(b[e]=function(){function b(a,d,e){return function(){c[e||"push"]([a,d,arguments]);return m}}if(!f)throw a("nomod",e);var c=[],d=[],l=b("$injector","invoke"),m={_invokeQueue:c,_runBlocks:d,requires:f,name:e,provider:b("$provide","provider"),factory:b("$provide","factory"),service:b("$provide","service"),value:b("$provide","value"),constant:b("$provide",
"constant","unshift"),animation:b("$animateProvider","register"),filter:b("$filterProvider","register"),controller:b("$controllerProvider","register"),directive:b("$compileProvider","directive"),config:l,run:function(a){d.push(a);return this}};g&&l(g);return m}())}}())}function Ra(b){return b.replace(Xc,function(a,b,d,e){return e?d.toUpperCase():d}).replace(Yc,"Moz$1")}function Ab(b,a,c,d){function e(b){var e=c&&b?[this.filter(b)]:[this],n=a,k,l,m,p,q,A;if(!d||null!=b)for(;e.length;)for(k=e.shift(),
l=0,m=k.length;l<m;l++)for(p=z(k[l]),n?p.triggerHandler("$destroy"):n=!n,q=0,p=(A=p.children()).length;q<p;q++)e.push(Ca(A[q]));return f.apply(this,arguments)}var f=Ca.fn[b],f=f.$original||f;e.$original=f;Ca.fn[b]=e}function R(b){if(b instanceof R)return b;D(b)&&(b=da(b));if(!(this instanceof R)){if(D(b)&&"<"!=b.charAt(0))throw Bb("nosel");return new R(b)}if(D(b)){var a=T.createElement("div");a.innerHTML="<div>&#160;</div>"+b;a.removeChild(a.firstChild);Cb(this,a.childNodes);z(T.createDocumentFragment()).append(this)}else Cb(this,
b)}function Db(b){return b.cloneNode(!0)}function Da(b){cc(b);var a=0;for(b=b.childNodes||[];a<b.length;a++)Da(b[a])}function dc(b,a,c,d){if(v(d))throw Bb("offargs");var e=ka(b,"events");ka(b,"handle")&&(x(a)?r(e,function(a,c){Eb(b,c,a);delete e[c]}):r(a.split(" "),function(a){x(c)?(Eb(b,a,e[a]),delete e[a]):Na(e[a]||[],c)}))}function cc(b,a){var c=b[eb],d=Sa[c];d&&(a?delete Sa[c].data[a]:(d.handle&&(d.events.$destroy&&d.handle({},"$destroy"),dc(b)),delete Sa[c],b[eb]=s))}function ka(b,a,c){var d=
b[eb],d=Sa[d||-1];if(v(c))d||(b[eb]=d=++Zc,d=Sa[d]={}),d[a]=c;else return d&&d[a]}function ec(b,a,c){var d=ka(b,"data"),e=v(c),f=!e&&v(a),g=f&&!Z(a);d||g||ka(b,"data",d={});if(e)d[a]=c;else if(f){if(g)return d&&d[a];t(d,a)}else return d}function Fb(b,a){return b.getAttribute?-1<(" "+(b.getAttribute("class")||"")+" ").replace(/[\n\t]/g," ").indexOf(" "+a+" "):!1}function fb(b,a){a&&b.setAttribute&&r(a.split(" "),function(a){b.setAttribute("class",da((" "+(b.getAttribute("class")||"")+" ").replace(/[\n\t]/g,
" ").replace(" "+da(a)+" "," ")))})}function gb(b,a){if(a&&b.setAttribute){var c=(" "+(b.getAttribute("class")||"")+" ").replace(/[\n\t]/g," ");r(a.split(" "),function(a){a=da(a);-1===c.indexOf(" "+a+" ")&&(c+=a+" ")});b.setAttribute("class",da(c))}}function Cb(b,a){if(a){a=a.nodeName||!v(a.length)||za(a)?[a]:a;for(var c=0;c<a.length;c++)b.push(a[c])}}function fc(b,a){return hb(b,"$"+(a||"ngController")+"Controller")}function hb(b,a,c){b=z(b);9==b[0].nodeType&&(b=b.find("html"));for(a=H(a)?a:[a];b.length;){for(var d=
0,e=a.length;d<e;d++)if((c=b.data(a[d]))!==s)return c;b=b.parent()}}function gc(b){for(var a=0,c=b.childNodes;a<c.length;a++)Da(c[a]);for(;b.firstChild;)b.removeChild(b.firstChild)}function hc(b,a){var c=ib[a.toLowerCase()];return c&&ic[b.nodeName]&&c}function $c(b,a){var c=function(c,e){c.preventDefault||(c.preventDefault=function(){c.returnValue=!1});c.stopPropagation||(c.stopPropagation=function(){c.cancelBubble=!0});c.target||(c.target=c.srcElement||T);if(x(c.defaultPrevented)){var f=c.preventDefault;
c.preventDefault=function(){c.defaultPrevented=!0;f.call(c)};c.defaultPrevented=!1}c.isDefaultPrevented=function(){return c.defaultPrevented||!1===c.returnValue};var g=Ub(a[e||c.type]||[]);r(g,function(a){a.call(b,c)});8>=P?(c.preventDefault=null,c.stopPropagation=null,c.isDefaultPrevented=null):(delete c.preventDefault,delete c.stopPropagation,delete c.isDefaultPrevented)};c.elem=b;return c}function Ea(b){var a=typeof b,c;"object"==a&&null!==b?"function"==typeof(c=b.$$hashKey)?c=b.$$hashKey():c===
s&&(c=b.$$hashKey=$a()):c=b;return a+":"+c}function Ta(b){r(b,this.put,this)}function jc(b){var a,c;"function"==typeof b?(a=b.$inject)||(a=[],b.length&&(c=b.toString().replace(ad,""),c=c.match(bd),r(c[1].split(cd),function(b){b.replace(dd,function(b,c,d){a.push(d)})})),b.$inject=a):H(b)?(c=b.length-1,Qa(b[c],"fn"),a=b.slice(0,c)):Qa(b,"fn",!0);return a}function ac(b){function a(a){return function(b,c){if(Z(b))r(b,Rb(a));else return a(b,c)}}function c(a,b){wa(a,"service");if(N(b)||H(b))b=m.instantiate(b);
if(!b.$get)throw Ua("pget",a);return l[a+h]=b}function d(a,b){return c(a,{$get:b})}function e(a){var b=[],c,d,f,h;r(a,function(a){if(!k.get(a)){k.put(a,!0);try{if(D(a))for(c=Va(a),b=b.concat(e(c.requires)).concat(c._runBlocks),d=c._invokeQueue,f=0,h=d.length;f<h;f++){var g=d[f],n=m.get(g[0]);n[g[1]].apply(n,g[2])}else N(a)?b.push(m.invoke(a)):H(a)?b.push(m.invoke(a)):Qa(a,"module")}catch(q){throw H(a)&&(a=a[a.length-1]),q.message&&(q.stack&&-1==q.stack.indexOf(q.message))&&(q=q.message+"\n"+q.stack),
Ua("modulerr",a,q.stack||q.message||q);}}});return b}function f(a,b){function c(d){if(a.hasOwnProperty(d)){if(a[d]===g)throw Ua("cdep",n.join(" <- "));return a[d]}try{return n.unshift(d),a[d]=g,a[d]=b(d)}catch(e){throw a[d]===g&&delete a[d],e;}finally{n.shift()}}function d(a,b,e){var f=[],h=jc(a),g,n,k;n=0;for(g=h.length;n<g;n++){k=h[n];if("string"!==typeof k)throw Ua("itkn",k);f.push(e&&e.hasOwnProperty(k)?e[k]:c(k))}a.$inject||(a=a[g]);return a.apply(b,f)}return{invoke:d,instantiate:function(a,
b){var c=function(){},e;c.prototype=(H(a)?a[a.length-1]:a).prototype;c=new c;e=d(a,c,b);return Z(e)||N(e)?e:c},get:c,annotate:jc,has:function(b){return l.hasOwnProperty(b+h)||a.hasOwnProperty(b)}}}var g={},h="Provider",n=[],k=new Ta,l={$provide:{provider:a(c),factory:a(d),service:a(function(a,b){return d(a,["$injector",function(a){return a.instantiate(b)}])}),value:a(function(a,b){return d(a,aa(b))}),constant:a(function(a,b){wa(a,"constant");l[a]=b;p[a]=b}),decorator:function(a,b){var c=m.get(a+h),
d=c.$get;c.$get=function(){var a=q.invoke(d,c);return q.invoke(b,null,{$delegate:a})}}}},m=l.$injector=f(l,function(){throw Ua("unpr",n.join(" <- "));}),p={},q=p.$injector=f(p,function(a){a=m.get(a+h);return q.invoke(a.$get,a)});r(e(b),function(a){q.invoke(a||w)});return q}function ed(){var b=!0;this.disableAutoScrolling=function(){b=!1};this.$get=["$window","$location","$rootScope",function(a,c,d){function e(a){var b=null;r(a,function(a){b||"a"!==O(a.nodeName)||(b=a)});return b}function f(){var b=
c.hash(),d;b?(d=g.getElementById(b))?d.scrollIntoView():(d=e(g.getElementsByName(b)))?d.scrollIntoView():"top"===b&&a.scrollTo(0,0):a.scrollTo(0,0)}var g=a.document;b&&d.$watch(function(){return c.hash()},function(){d.$evalAsync(f)});return f}]}function fd(b,a,c,d){function e(a){try{a.apply(null,ua.call(arguments,1))}finally{if(A--,0===A)for(;B.length;)try{B.pop()()}catch(b){c.error(b)}}}function f(a,b){(function kb(){r(I,function(a){a()});u=b(kb,a)})()}function g(){y=null;G!=h.url()&&(G=h.url(),
r(Y,function(a){a(h.url())}))}var h=this,n=a[0],k=b.location,l=b.history,m=b.setTimeout,p=b.clearTimeout,q={};h.isMock=!1;var A=0,B=[];h.$$completeOutstandingRequest=e;h.$$incOutstandingRequestCount=function(){A++};h.notifyWhenNoOutstandingRequests=function(a){r(I,function(a){a()});0===A?a():B.push(a)};var I=[],u;h.addPollFn=function(a){x(u)&&f(100,m);I.push(a);return a};var G=k.href,W=a.find("base"),y=null;h.url=function(a,c){k!==b.location&&(k=b.location);l!==b.history&&(l=b.history);if(a){if(G!=
a)return G=a,d.history?c?l.replaceState(null,"",a):(l.pushState(null,"",a),W.attr("href",W.attr("href"))):(y=a,c?k.replace(a):k.href=a),h}else return y||k.href.replace(/%27/g,"'")};var Y=[],S=!1;h.onUrlChange=function(a){if(!S){if(d.history)z(b).on("popstate",g);if(d.hashchange)z(b).on("hashchange",g);else h.addPollFn(g);S=!0}Y.push(a);return a};h.baseHref=function(){var a=W.attr("href");return a?a.replace(/^(https?\:)?\/\/[^\/]*/,""):""};var L={},ba="",U=h.baseHref();h.cookies=function(a,b){var d,
e,f,h;if(a)b===s?n.cookie=escape(a)+"=;path="+U+";expires=Thu, 01 Jan 1970 00:00:00 GMT":D(b)&&(d=(n.cookie=escape(a)+"="+escape(b)+";path="+U).length+1,4096<d&&c.warn("Cookie '"+a+"' possibly not set or overflowed because it was too large ("+d+" > 4096 bytes)!"));else{if(n.cookie!==ba)for(ba=n.cookie,d=ba.split("; "),L={},f=0;f<d.length;f++)e=d[f],h=e.indexOf("="),0<h&&(a=unescape(e.substring(0,h)),L[a]===s&&(L[a]=unescape(e.substring(h+1))));return L}};h.defer=function(a,b){var c;A++;c=m(function(){delete q[c];
e(a)},b||0);q[c]=!0;return c};h.defer.cancel=function(a){return q[a]?(delete q[a],p(a),e(w),!0):!1}}function gd(){this.$get=["$window","$log","$sniffer","$document",function(b,a,c,d){return new fd(b,d,a,c)}]}function hd(){this.$get=function(){function b(b,d){function e(a){a!=m&&(p?p==a&&(p=a.n):p=a,f(a.n,a.p),f(a,m),m=a,m.n=null)}function f(a,b){a!=b&&(a&&(a.p=b),b&&(b.n=a))}if(b in a)throw E("$cacheFactory")("iid",b);var g=0,h=t({},d,{id:b}),n={},k=d&&d.capacity||Number.MAX_VALUE,l={},m=null,p=null;
return a[b]={put:function(a,b){var c=l[a]||(l[a]={key:a});e(c);if(!x(b))return a in n||g++,n[a]=b,g>k&&this.remove(p.key),b},get:function(a){var b=l[a];if(b)return e(b),n[a]},remove:function(a){var b=l[a];b&&(b==m&&(m=b.p),b==p&&(p=b.n),f(b.n,b.p),delete l[a],delete n[a],g--)},removeAll:function(){n={};g=0;l={};m=p=null},destroy:function(){l=h=n=null;delete a[b]},info:function(){return t({},h,{size:g})}}}var a={};b.info=function(){var b={};r(a,function(a,e){b[e]=a.info()});return b};b.get=function(b){return a[b]};
return b}}function id(){this.$get=["$cacheFactory",function(b){return b("templates")}]}function kc(b,a){var c={},d="Directive",e=/^\s*directive\:\s*([\d\w\-_]+)\s+(.*)$/,f=/(([\d\w\-_]+)(?:\:([^;]+))?;?)/,g=/^<\s*(tr|th|td|tbody)(\s+[^>]*)?>/i,h=/^(on[a-z]+|formaction)$/;this.directive=function k(a,e){wa(a,"directive");D(a)?(yb(e,"directiveFactory"),c.hasOwnProperty(a)||(c[a]=[],b.factory(a+d,["$injector","$exceptionHandler",function(b,d){var e=[];r(c[a],function(c,f){try{var h=b.invoke(c);N(h)?h=
{compile:aa(h)}:!h.compile&&h.link&&(h.compile=aa(h.link));h.priority=h.priority||0;h.index=f;h.name=h.name||a;h.require=h.require||h.controller&&h.name;h.restrict=h.restrict||"A";e.push(h)}catch(g){d(g)}});return e}])),c[a].push(e)):r(a,Rb(k));return this};this.aHrefSanitizationWhitelist=function(b){return v(b)?(a.aHrefSanitizationWhitelist(b),this):a.aHrefSanitizationWhitelist()};this.imgSrcSanitizationWhitelist=function(b){return v(b)?(a.imgSrcSanitizationWhitelist(b),this):a.imgSrcSanitizationWhitelist()};
this.$get=["$injector","$interpolate","$exceptionHandler","$http","$templateCache","$parse","$controller","$rootScope","$document","$sce","$animate","$$sanitizeUri",function(a,b,m,p,q,A,B,I,u,G,W,y){function Y(a,b,c,d,e){a instanceof z||(a=z(a));r(a,function(b,c){3==b.nodeType&&b.nodeValue.match(/\S+/)&&(a[c]=z(b).wrap("<span></span>").parent()[0])});var f=L(a,b,a,c,d,e);S(a,"ng-scope");return function(b,c,d){yb(b,"scope");var e=c?Fa.clone.call(a):a;r(d,function(a,b){e.data("$"+b+"Controller",a)});
d=0;for(var h=e.length;d<h;d++){var g=e[d].nodeType;1!==g&&9!==g||e.eq(d).data("$scope",b)}c&&c(e,b);f&&f(b,e,e);return e}}function S(a,b){try{a.addClass(b)}catch(c){}}function L(a,b,c,d,e,f){function h(a,c,d,e){var f,k,q,l,m,p,K;f=c.length;var A=Array(f);for(m=0;m<f;m++)A[m]=c[m];K=m=0;for(p=g.length;m<p;K++)k=A[K],c=g[m++],f=g[m++],q=z(k),c?(c.scope?(l=a.$new(),q.data("$scope",l)):l=a,(q=c.transclude)||!e&&b?c(f,l,k,d,ba(a,q||b)):c(f,l,k,d,e)):f&&f(a,k.childNodes,s,e)}for(var g=[],k,q,l,m,p=0;p<
a.length;p++)k=new Gb,q=U(a[p],[],k,0===p?d:s,e),(f=q.length?Wa(q,a[p],k,b,c,null,[],[],f):null)&&f.scope&&S(z(a[p]),"ng-scope"),k=f&&f.terminal||!(l=a[p].childNodes)||!l.length?null:L(l,f?f.transclude:b),g.push(f,k),m=m||f||k,f=null;return m?h:null}function ba(a,b){return function(c,d,e){var f=!1;c||(c=a.$new(),f=c.$$transcluded=!0);d=b(c,d,e);if(f)d.on("$destroy",cb(c,c.$destroy));return d}}function U(a,b,c,d,h){var g=c.$attr,k;switch(a.nodeType){case 1:v(b,la(Ga(a).toLowerCase()),"E",d,h);var q,
l,m;k=a.attributes;for(var p=0,A=k&&k.length;p<A;p++){var B=!1,G=!1;q=k[p];if(!P||8<=P||q.specified){l=q.name;m=la(l);pa.test(m)&&(l=db(m.substr(6),"-"));var I=m.replace(/(Start|End)$/,"");m===I+"Start"&&(B=l,G=l.substr(0,l.length-5)+"end",l=l.substr(0,l.length-6));m=la(l.toLowerCase());g[m]=l;c[m]=q=da(q.value);hc(a,m)&&(c[m]=!0);ha(a,b,q,m);v(b,m,"A",d,h,B,G)}}a=a.className;if(D(a)&&""!==a)for(;k=f.exec(a);)m=la(k[2]),v(b,m,"C",d,h)&&(c[m]=da(k[3])),a=a.substr(k.index+k[0].length);break;case 3:C(b,
a.nodeValue);break;case 8:try{if(k=e.exec(a.nodeValue))m=la(k[1]),v(b,m,"M",d,h)&&(c[m]=da(k[2]))}catch(y){}}b.sort(E);return b}function M(a,b,c){var d=[],e=0;if(b&&a.hasAttribute&&a.hasAttribute(b)){do{if(!a)throw ia("uterdir",b,c);1==a.nodeType&&(a.hasAttribute(b)&&e++,a.hasAttribute(c)&&e--);d.push(a);a=a.nextSibling}while(0<e)}else d.push(a);return z(d)}function jb(a,b,c){return function(d,e,f,h,g){e=M(e[0],b,c);return a(d,e,f,h,g)}}function Wa(a,c,d,e,f,h,g,k,q){function p(a,b,c,d){if(a){c&&
(a=jb(a,c,d));a.require=F.require;if(L===F||F.$$isolateScope)a=lc(a,{isolateScope:!0});g.push(a)}if(b){c&&(b=jb(b,c,d));b.require=F.require;if(L===F||F.$$isolateScope)b=lc(b,{isolateScope:!0});k.push(b)}}function G(a,b,c){var d,e="data",f=!1;if(D(a)){for(;"^"==(d=a.charAt(0))||"?"==d;)a=a.substr(1),"^"==d&&(e="inheritedData"),f=f||"?"==d;d=null;c&&"data"===e&&(d=c[a]);d=d||b[e]("$"+a+"Controller");if(!d&&!f)throw ia("ctreq",a,ha);}else H(a)&&(d=[],r(a,function(a){d.push(G(a,b,c))}));return d}function I(a,
e,f,h,q){function p(a,b){var c;2>arguments.length&&(b=a,a=s);Ha&&(c=lb);return q(a,b,c)}var K,y,u,Y,M,U,lb={},v;K=c===f?d:Ub(d,new Gb(z(f),d.$attr));y=K.$$element;if(L){var t=/^\s*([@=&])(\??)\s*(\w*)\s*$/;h=z(f);U=e.$new(!0);ba&&ba===L.$$originalDirective?h.data("$isolateScope",U):h.data("$isolateScopeNoTemplate",U);S(h,"ng-isolate-scope");r(L.scope,function(a,c){var d=a.match(t)||[],f=d[3]||c,h="?"==d[2],d=d[1],g,k,q,m;U.$$isolateBindings[c]=d+f;switch(d){case "@":K.$observe(f,function(a){U[c]=
a});K.$$observers[f].$$scope=e;K[f]&&(U[c]=b(K[f])(e));break;case "=":if(h&&!K[f])break;k=A(K[f]);m=k.literal?ta:function(a,b){return a===b};q=k.assign||function(){g=U[c]=k(e);throw ia("nonassign",K[f],L.name);};g=U[c]=k(e);U.$watch(function(){var a=k(e);m(a,U[c])||(m(a,g)?q(e,a=U[c]):U[c]=a);return g=a},null,k.literal);break;case "&":k=A(K[f]);U[c]=function(a){return k(e,a)};break;default:throw ia("iscp",L.name,c,a);}})}v=q&&p;W&&r(W,function(a){var b={$scope:a===L||a.$$isolateScope?U:e,$element:y,
$attrs:K,$transclude:v},c;M=a.controller;"@"==M&&(M=K[a.name]);c=B(M,b);lb[a.name]=c;Ha||y.data("$"+a.name+"Controller",c);a.controllerAs&&(b.$scope[a.controllerAs]=c)});h=0;for(u=g.length;h<u;h++)try{Y=g[h],Y(Y.isolateScope?U:e,y,K,Y.require&&G(Y.require,y,lb),v)}catch(J){m(J,ga(y))}h=e;L&&(L.template||null===L.templateUrl)&&(h=U);a&&a(h,f.childNodes,s,q);for(h=k.length-1;0<=h;h--)try{Y=k[h],Y(Y.isolateScope?U:e,y,K,Y.require&&G(Y.require,y,lb),v)}catch(jb){m(jb,ga(y))}}q=q||{};for(var y=-Number.MAX_VALUE,
u,W=q.controllerDirectives,L=q.newIsolateScopeDirective,ba=q.templateDirective,v=q.nonTlbTranscludeDirective,Wa=!1,Ha=q.hasElementTranscludeDirective,J=d.$$element=z(c),F,ha,t,E=e,pa,C=0,P=a.length;C<P;C++){F=a[C];var Q=F.$$start,V=F.$$end;Q&&(J=M(c,Q,V));t=s;if(y>F.priority)break;if(t=F.scope)u=u||F,F.templateUrl||(R("new/isolated scope",L,F,J),Z(t)&&(L=F));ha=F.name;!F.templateUrl&&F.controller&&(t=F.controller,W=W||{},R("'"+ha+"' controller",W[ha],F,J),W[ha]=F);if(t=F.transclude)Wa=!0,F.$$tlb||
(R("transclusion",v,F,J),v=F),"element"==t?(Ha=!0,y=F.priority,t=M(c,Q,V),J=d.$$element=z(T.createComment(" "+ha+": "+d[ha]+" ")),c=J[0],mb(f,z(ua.call(t,0)),c),E=Y(t,e,y,h&&h.name,{nonTlbTranscludeDirective:v})):(t=z(Db(c)).contents(),J.empty(),E=Y(t,e));if(F.template)if(R("template",ba,F,J),ba=F,t=N(F.template)?F.template(J,d):F.template,t=X(t),F.replace){h=F;t=x(t);c=t[0];if(1!=t.length||1!==c.nodeType)throw ia("tplrt",ha,"");mb(f,J,c);P={$attr:{}};t=U(c,[],P);var $=a.splice(C+1,a.length-(C+1));
L&&kb(t);a=a.concat(t).concat($);w(d,P);P=a.length}else J.html(t);if(F.templateUrl)R("template",ba,F,J),ba=F,F.replace&&(h=F),I=O(a.splice(C,a.length-C),J,d,f,E,g,k,{controllerDirectives:W,newIsolateScopeDirective:L,templateDirective:ba,nonTlbTranscludeDirective:v}),P=a.length;else if(F.compile)try{pa=F.compile(J,d,E),N(pa)?p(null,pa,Q,V):pa&&p(pa.pre,pa.post,Q,V)}catch(aa){m(aa,ga(J))}F.terminal&&(I.terminal=!0,y=Math.max(y,F.priority))}I.scope=u&&!0===u.scope;I.transclude=Wa&&E;q.hasElementTranscludeDirective=
Ha;return I}function kb(a){for(var b=0,c=a.length;b<c;b++)a[b]=Tb(a[b],{$$isolateScope:!0})}function v(b,e,f,h,g,q,l){if(e===g)return null;g=null;if(c.hasOwnProperty(e)){var p;e=a.get(e+d);for(var A=0,G=e.length;A<G;A++)try{p=e[A],(h===s||h>p.priority)&&-1!=p.restrict.indexOf(f)&&(q&&(p=Tb(p,{$$start:q,$$end:l})),b.push(p),g=p)}catch(B){m(B)}}return g}function w(a,b){var c=b.$attr,d=a.$attr,e=a.$$element;r(a,function(d,e){"$"!=e.charAt(0)&&(b[e]&&(d+=("style"===e?";":" ")+b[e]),a.$set(e,d,!0,c[e]))});
r(b,function(b,f){"class"==f?(S(e,b),a["class"]=(a["class"]?a["class"]+" ":"")+b):"style"==f?(e.attr("style",e.attr("style")+";"+b),a.style=(a.style?a.style+";":"")+b):"$"==f.charAt(0)||a.hasOwnProperty(f)||(a[f]=b,d[f]=c[f])})}function x(a){var b;a=da(a);if(b=g.exec(a)){b=b[1].toLowerCase();a=z("<table>"+a+"</table>");var c=a.children("tbody"),d=/(td|th)/.test(b)&&a.find("tr");c.length&&"tbody"!==b&&(a=c);d&&d.length&&(a=d);return a.contents()}return z("<div>"+a+"</div>").contents()}function O(a,
b,c,d,e,f,h,g){var k=[],l,m,A=b[0],B=a.shift(),y=t({},B,{templateUrl:null,transclude:null,replace:null,$$originalDirective:B}),I=N(B.templateUrl)?B.templateUrl(b,c):B.templateUrl;b.empty();p.get(G.getTrustedResourceUrl(I),{cache:q}).success(function(q){var p,G;q=X(q);if(B.replace){q=x(q);p=q[0];if(1!=q.length||1!==p.nodeType)throw ia("tplrt",B.name,I);q={$attr:{}};mb(d,b,p);var u=U(p,[],q);Z(B.scope)&&kb(u);a=u.concat(a);w(c,q)}else p=A,b.html(q);a.unshift(y);l=Wa(a,p,c,e,b,B,f,h,g);r(d,function(a,
c){a==p&&(d[c]=b[0])});for(m=L(b[0].childNodes,e);k.length;){q=k.shift();G=k.shift();var W=k.shift(),Y=k.shift(),u=b[0];if(G!==A){var M=G.className;g.hasElementTranscludeDirective&&B.replace||(u=Db(p));mb(W,z(G),u);S(z(u),M)}G=l.transclude?ba(q,l.transclude):Y;l(m,q,u,d,G)}k=null}).error(function(a,b,c,d){throw ia("tpload",d.url);});return function(a,b,c,d,e){k?(k.push(b),k.push(c),k.push(d),k.push(e)):l(m,b,c,d,e)}}function E(a,b){var c=b.priority-a.priority;return 0!==c?c:a.name!==b.name?a.name<
b.name?-1:1:a.index-b.index}function R(a,b,c,d){if(b)throw ia("multidir",b.name,c.name,a,ga(d));}function C(a,c){var d=b(c,!0);d&&a.push({priority:0,compile:aa(function(a,b){var c=b.parent(),e=c.data("$binding")||[];e.push(d);S(c.data("$binding",e),"ng-binding");a.$watch(d,function(a){b[0].nodeValue=a})})})}function Ha(a,b){if("srcdoc"==b)return G.HTML;var c=Ga(a);if("xlinkHref"==b||"FORM"==c&&"action"==b||"IMG"!=c&&("src"==b||"ngSrc"==b))return G.RESOURCE_URL}function ha(a,c,d,e){var f=b(d,!0);if(f){if("multiple"===
e&&"SELECT"===Ga(a))throw ia("selmulti",ga(a));c.push({priority:100,compile:function(){return{pre:function(c,d,g){d=g.$$observers||(g.$$observers={});if(h.test(e))throw ia("nodomevents");if(f=b(g[e],!0,Ha(a,e)))g[e]=f(c),(d[e]||(d[e]=[])).$$inter=!0,(g.$$observers&&g.$$observers[e].$$scope||c).$watch(f,function(a,b){"class"===e&&a!=b?g.$updateClass(a,b):g.$set(e,a)})}}}})}}function mb(a,b,c){var d=b[0],e=b.length,f=d.parentNode,h,g;if(a)for(h=0,g=a.length;h<g;h++)if(a[h]==d){a[h++]=c;g=h+e-1;for(var k=
a.length;h<k;h++,g++)g<k?a[h]=a[g]:delete a[h];a.length-=e-1;break}f&&f.replaceChild(c,d);a=T.createDocumentFragment();a.appendChild(d);c[z.expando]=d[z.expando];d=1;for(e=b.length;d<e;d++)f=b[d],z(f).remove(),a.appendChild(f),delete b[d];b[0]=c;b.length=1}function lc(a,b){return t(function(){return a.apply(null,arguments)},a,b)}var Gb=function(a,b){this.$$element=a;this.$attr=b||{}};Gb.prototype={$normalize:la,$addClass:function(a){a&&0<a.length&&W.addClass(this.$$element,a)},$removeClass:function(a){a&&
0<a.length&&W.removeClass(this.$$element,a)},$updateClass:function(a,b){var c=mc(a,b),d=mc(b,a);0===c.length?W.removeClass(this.$$element,d):0===d.length?W.addClass(this.$$element,c):W.setClass(this.$$element,c,d)},$set:function(a,b,c,d){var e=hc(this.$$element[0],a);e&&(this.$$element.prop(a,b),d=e);this[a]=b;d?this.$attr[a]=d:(d=this.$attr[a])||(this.$attr[a]=d=db(a,"-"));e=Ga(this.$$element);if("A"===e&&"href"===a||"IMG"===e&&"src"===a)this[a]=b=y(b,"src"===a);!1!==c&&(null===b||b===s?this.$$element.removeAttr(d):
this.$$element.attr(d,b));(c=this.$$observers)&&r(c[a],function(a){try{a(b)}catch(c){m(c)}})},$observe:function(a,b){var c=this,d=c.$$observers||(c.$$observers={}),e=d[a]||(d[a]=[]);e.push(b);I.$evalAsync(function(){e.$$inter||b(c[a])});return b}};var Q=b.startSymbol(),V=b.endSymbol(),X="{{"==Q||"}}"==V?Aa:function(a){return a.replace(/\{\{/g,Q).replace(/}}/g,V)},pa=/^ngAttr[A-Z]/;return Y}]}function la(b){return Ra(b.replace(jd,""))}function mc(b,a){var c="",d=b.split(/\s+/),e=a.split(/\s+/),f=0;
a:for(;f<d.length;f++){for(var g=d[f],h=0;h<e.length;h++)if(g==e[h])continue a;c+=(0<c.length?" ":"")+g}return c}function kd(){var b={},a=/^(\S+)(\s+as\s+(\w+))?$/;this.register=function(a,d){wa(a,"controller");Z(a)?t(b,a):b[a]=d};this.$get=["$injector","$window",function(c,d){return function(e,f){var g,h,n;D(e)&&(g=e.match(a),h=g[1],n=g[3],e=b.hasOwnProperty(h)?b[h]:bc(f.$scope,h,!0)||bc(d,h,!0),Qa(e,h,!0));g=c.instantiate(e,f);if(n){if(!f||"object"!=typeof f.$scope)throw E("$controller")("noscp",
h||e.name,n);f.$scope[n]=g}return g}}]}function ld(){this.$get=["$window",function(b){return z(b.document)}]}function md(){this.$get=["$log",function(b){return function(a,c){b.error.apply(b,arguments)}}]}function nc(b){var a={},c,d,e;if(!b)return a;r(b.split("\n"),function(b){e=b.indexOf(":");c=O(da(b.substr(0,e)));d=da(b.substr(e+1));c&&(a[c]=a[c]?a[c]+(", "+d):d)});return a}function oc(b){var a=Z(b)?b:s;return function(c){a||(a=nc(b));return c?a[O(c)]||null:a}}function pc(b,a,c){if(N(c))return c(b,
a);r(c,function(c){b=c(b,a)});return b}function nd(){var b=/^\s*(\[|\{[^\{])/,a=/[\}\]]\s*$/,c=/^\)\]\}',?\n/,d={"Content-Type":"application/json;charset=utf-8"},e=this.defaults={transformResponse:[function(d){D(d)&&(d=d.replace(c,""),b.test(d)&&a.test(d)&&(d=Wb(d)));return d}],transformRequest:[function(a){return Z(a)&&"[object File]"!==Ma.call(a)?oa(a):a}],headers:{common:{Accept:"application/json, text/plain, */*"},post:ca(d),put:ca(d),patch:ca(d)},xsrfCookieName:"XSRF-TOKEN",xsrfHeaderName:"X-XSRF-TOKEN"},
f=this.interceptors=[],g=this.responseInterceptors=[];this.$get=["$httpBackend","$browser","$cacheFactory","$rootScope","$q","$injector",function(a,b,c,d,m,p){function q(a){function c(a){var b=t({},a,{data:pc(a.data,a.headers,d.transformResponse)});return 200<=a.status&&300>a.status?b:m.reject(b)}var d={transformRequest:e.transformRequest,transformResponse:e.transformResponse},f=function(a){function b(a){var c;r(a,function(b,d){N(b)&&(c=b(),null!=c?a[d]=c:delete a[d])})}var c=e.headers,d=t({},a.headers),
f,h,c=t({},c.common,c[O(a.method)]);b(c);b(d);a:for(f in c){a=O(f);for(h in d)if(O(h)===a)continue a;d[f]=c[f]}return d}(a);t(d,a);d.headers=f;d.method=Ia(d.method);(a=Hb(d.url)?b.cookies()[d.xsrfCookieName||e.xsrfCookieName]:s)&&(f[d.xsrfHeaderName||e.xsrfHeaderName]=a);var h=[function(a){f=a.headers;var b=pc(a.data,oc(f),a.transformRequest);x(a.data)&&r(f,function(a,b){"content-type"===O(b)&&delete f[b]});x(a.withCredentials)&&!x(e.withCredentials)&&(a.withCredentials=e.withCredentials);return A(a,
b,f).then(c,c)},s],g=m.when(d);for(r(u,function(a){(a.request||a.requestError)&&h.unshift(a.request,a.requestError);(a.response||a.responseError)&&h.push(a.response,a.responseError)});h.length;){a=h.shift();var k=h.shift(),g=g.then(a,k)}g.success=function(a){g.then(function(b){a(b.data,b.status,b.headers,d)});return g};g.error=function(a){g.then(null,function(b){a(b.data,b.status,b.headers,d)});return g};return g}function A(b,c,f){function g(a,b,c){u&&(200<=a&&300>a?u.put(s,[a,b,nc(c)]):u.remove(s));
k(b,a,c);d.$$phase||d.$apply()}function k(a,c,d){c=Math.max(c,0);(200<=c&&300>c?p.resolve:p.reject)({data:a,status:c,headers:oc(d),config:b})}function n(){var a=bb(q.pendingRequests,b);-1!==a&&q.pendingRequests.splice(a,1)}var p=m.defer(),A=p.promise,u,r,s=B(b.url,b.params);q.pendingRequests.push(b);A.then(n,n);(b.cache||e.cache)&&(!1!==b.cache&&"GET"==b.method)&&(u=Z(b.cache)?b.cache:Z(e.cache)?e.cache:I);if(u)if(r=u.get(s),v(r)){if(r.then)return r.then(n,n),r;H(r)?k(r[1],r[0],ca(r[2])):k(r,200,
{})}else u.put(s,A);x(r)&&a(b.method,s,c,g,f,b.timeout,b.withCredentials,b.responseType);return A}function B(a,b){if(!b)return a;var c=[];Qc(b,function(a,b){null===a||x(a)||(H(a)||(a=[a]),r(a,function(a){Z(a)&&(a=oa(a));c.push(va(b)+"="+va(a))}))});return a+(-1==a.indexOf("?")?"?":"&")+c.join("&")}var I=c("$http"),u=[];r(f,function(a){u.unshift(D(a)?p.get(a):p.invoke(a))});r(g,function(a,b){var c=D(a)?p.get(a):p.invoke(a);u.splice(b,0,{response:function(a){return c(m.when(a))},responseError:function(a){return c(m.reject(a))}})});
q.pendingRequests=[];(function(a){r(arguments,function(a){q[a]=function(b,c){return q(t(c||{},{method:a,url:b}))}})})("get","delete","head","jsonp");(function(a){r(arguments,function(a){q[a]=function(b,c,d){return q(t(d||{},{method:a,url:b,data:c}))}})})("post","put");q.defaults=e;return q}]}function od(b){if(8>=P&&(!b.match(/^(get|post|head|put|delete|options)$/i)||!C.XMLHttpRequest))return new C.ActiveXObject("Microsoft.XMLHTTP");if(C.XMLHttpRequest)return new C.XMLHttpRequest;throw E("$httpBackend")("noxhr");
}function pd(){this.$get=["$browser","$window","$document",function(b,a,c){return qd(b,od,b.defer,a.angular.callbacks,c[0])}]}function qd(b,a,c,d,e){function f(a,b){var c=e.createElement("script"),d=function(){c.onreadystatechange=c.onload=c.onerror=null;e.body.removeChild(c);b&&b()};c.type="text/javascript";c.src=a;P&&8>=P?c.onreadystatechange=function(){/loaded|complete/.test(c.readyState)&&d()}:c.onload=c.onerror=function(){d()};e.body.appendChild(c);return d}var g=-1;return function(e,n,k,l,m,
p,q,A){function B(){u=g;W&&W();y&&y.abort()}function I(a,d,e,f){S&&c.cancel(S);W=y=null;d=0===d?e?200:404:d;a(1223==d?204:d,e,f);b.$$completeOutstandingRequest(w)}var u;b.$$incOutstandingRequestCount();n=n||b.url();if("jsonp"==O(e)){var G="_"+(d.counter++).toString(36);d[G]=function(a){d[G].data=a};var W=f(n.replace("JSON_CALLBACK","angular.callbacks."+G),function(){d[G].data?I(l,200,d[G].data):I(l,u||-2);d[G]=Ba.noop})}else{var y=a(e);y.open(e,n,!0);r(m,function(a,b){v(a)&&y.setRequestHeader(b,a)});
y.onreadystatechange=function(){if(y&&4==y.readyState){var a=null,b=null;u!==g&&(a=y.getAllResponseHeaders(),b="response"in y?y.response:y.responseText);I(l,u||y.status,b,a)}};q&&(y.withCredentials=!0);if(A)try{y.responseType=A}catch(Y){if("json"!==A)throw Y;}y.send(k||null)}if(0<p)var S=c(B,p);else p&&p.then&&p.then(B)}}function rd(){var b="{{",a="}}";this.startSymbol=function(a){return a?(b=a,this):b};this.endSymbol=function(b){return b?(a=b,this):a};this.$get=["$parse","$exceptionHandler","$sce",
function(c,d,e){function f(f,k,l){for(var m,p,q=0,A=[],B=f.length,I=!1,u=[];q<B;)-1!=(m=f.indexOf(b,q))&&-1!=(p=f.indexOf(a,m+g))?(q!=m&&A.push(f.substring(q,m)),A.push(q=c(I=f.substring(m+g,p))),q.exp=I,q=p+h,I=!0):(q!=B&&A.push(f.substring(q)),q=B);(B=A.length)||(A.push(""),B=1);if(l&&1<A.length)throw qc("noconcat",f);if(!k||I)return u.length=B,q=function(a){try{for(var b=0,c=B,h;b<c;b++)"function"==typeof(h=A[b])&&(h=h(a),h=l?e.getTrusted(l,h):e.valueOf(h),null===h||x(h)?h="":"string"!=typeof h&&
(h=oa(h))),u[b]=h;return u.join("")}catch(g){a=qc("interr",f,g.toString()),d(a)}},q.exp=f,q.parts=A,q}var g=b.length,h=a.length;f.startSymbol=function(){return b};f.endSymbol=function(){return a};return f}]}function sd(){this.$get=["$rootScope","$window","$q",function(b,a,c){function d(d,g,h,n){var k=a.setInterval,l=a.clearInterval,m=c.defer(),p=m.promise,q=0,A=v(n)&&!n;h=v(h)?h:0;p.then(null,null,d);p.$$intervalId=k(function(){m.notify(q++);0<h&&q>=h&&(m.resolve(q),l(p.$$intervalId),delete e[p.$$intervalId]);
A||b.$apply()},g);e[p.$$intervalId]=m;return p}var e={};d.cancel=function(a){return a&&a.$$intervalId in e?(e[a.$$intervalId].reject("canceled"),clearInterval(a.$$intervalId),delete e[a.$$intervalId],!0):!1};return d}]}function td(){this.$get=function(){return{id:"en-us",NUMBER_FORMATS:{DECIMAL_SEP:".",GROUP_SEP:",",PATTERNS:[{minInt:1,minFrac:0,maxFrac:3,posPre:"",posSuf:"",negPre:"-",negSuf:"",gSize:3,lgSize:3},{minInt:1,minFrac:2,maxFrac:2,posPre:"\u00a4",posSuf:"",negPre:"(\u00a4",negSuf:")",
gSize:3,lgSize:3}],CURRENCY_SYM:"$"},DATETIME_FORMATS:{MONTH:"January February March April May June July August September October November December".split(" "),SHORTMONTH:"Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" "),DAY:"Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),SHORTDAY:"Sun Mon Tue Wed Thu Fri Sat".split(" "),AMPMS:["AM","PM"],medium:"MMM d, y h:mm:ss a","short":"M/d/yy h:mm a",fullDate:"EEEE, MMMM d, y",longDate:"MMMM d, y",mediumDate:"MMM d, y",shortDate:"M/d/yy",
mediumTime:"h:mm:ss a",shortTime:"h:mm a"},pluralCat:function(b){return 1===b?"one":"other"}}}}function rc(b){b=b.split("/");for(var a=b.length;a--;)b[a]=xb(b[a]);return b.join("/")}function sc(b,a,c){b=xa(b,c);a.$$protocol=b.protocol;a.$$host=b.hostname;a.$$port=Q(b.port)||ud[b.protocol]||null}function tc(b,a,c){var d="/"!==b.charAt(0);d&&(b="/"+b);b=xa(b,c);a.$$path=decodeURIComponent(d&&"/"===b.pathname.charAt(0)?b.pathname.substring(1):b.pathname);a.$$search=Yb(b.search);a.$$hash=decodeURIComponent(b.hash);
a.$$path&&"/"!=a.$$path.charAt(0)&&(a.$$path="/"+a.$$path)}function ma(b,a){if(0===a.indexOf(b))return a.substr(b.length)}function Xa(b){var a=b.indexOf("#");return-1==a?b:b.substr(0,a)}function Ib(b){return b.substr(0,Xa(b).lastIndexOf("/")+1)}function uc(b,a){this.$$html5=!0;a=a||"";var c=Ib(b);sc(b,this,b);this.$$parse=function(a){var e=ma(c,a);if(!D(e))throw Jb("ipthprfx",a,c);tc(e,this,b);this.$$path||(this.$$path="/");this.$$compose()};this.$$compose=function(){var a=Zb(this.$$search),b=this.$$hash?
"#"+xb(this.$$hash):"";this.$$url=rc(this.$$path)+(a?"?"+a:"")+b;this.$$absUrl=c+this.$$url.substr(1)};this.$$rewrite=function(d){var e;if((e=ma(b,d))!==s)return d=e,(e=ma(a,e))!==s?c+(ma("/",e)||e):b+d;if((e=ma(c,d))!==s)return c+e;if(c==d+"/")return c}}function Kb(b,a){var c=Ib(b);sc(b,this,b);this.$$parse=function(d){var e=ma(b,d)||ma(c,d),e="#"==e.charAt(0)?ma(a,e):this.$$html5?e:"";if(!D(e))throw Jb("ihshprfx",d,a);tc(e,this,b);d=this.$$path;var f=/^\/?.*?:(\/.*)/;0===e.indexOf(b)&&(e=e.replace(b,
""));f.exec(e)||(d=(e=f.exec(d))?e[1]:d);this.$$path=d;this.$$compose()};this.$$compose=function(){var c=Zb(this.$$search),e=this.$$hash?"#"+xb(this.$$hash):"";this.$$url=rc(this.$$path)+(c?"?"+c:"")+e;this.$$absUrl=b+(this.$$url?a+this.$$url:"")};this.$$rewrite=function(a){if(Xa(b)==Xa(a))return a}}function vc(b,a){this.$$html5=!0;Kb.apply(this,arguments);var c=Ib(b);this.$$rewrite=function(d){var e;if(b==Xa(d))return d;if(e=ma(c,d))return b+a+e;if(c===d+"/")return c}}function nb(b){return function(){return this[b]}}
function wc(b,a){return function(c){if(x(c))return this[b];this[b]=a(c);this.$$compose();return this}}function vd(){var b="",a=!1;this.hashPrefix=function(a){return v(a)?(b=a,this):b};this.html5Mode=function(b){return v(b)?(a=b,this):a};this.$get=["$rootScope","$browser","$sniffer","$rootElement",function(c,d,e,f){function g(a){c.$broadcast("$locationChangeSuccess",h.absUrl(),a)}var h,n=d.baseHref(),k=d.url();a?(n=k.substring(0,k.indexOf("/",k.indexOf("//")+2))+(n||"/"),e=e.history?uc:vc):(n=Xa(k),
e=Kb);h=new e(n,"#"+b);h.$$parse(h.$$rewrite(k));f.on("click",function(a){if(!a.ctrlKey&&!a.metaKey&&2!=a.which){for(var b=z(a.target);"a"!==O(b[0].nodeName);)if(b[0]===f[0]||!(b=b.parent())[0])return;var e=b.prop("href");Z(e)&&"[object SVGAnimatedString]"===e.toString()&&(e=xa(e.animVal).href);var g=h.$$rewrite(e);e&&(!b.attr("target")&&g&&!a.isDefaultPrevented())&&(a.preventDefault(),g!=d.url()&&(h.$$parse(g),c.$apply(),C.angular["ff-684208-preventDefault"]=!0))}});h.absUrl()!=k&&d.url(h.absUrl(),
!0);d.onUrlChange(function(a){h.absUrl()!=a&&(c.$evalAsync(function(){var b=h.absUrl();h.$$parse(a);c.$broadcast("$locationChangeStart",a,b).defaultPrevented?(h.$$parse(b),d.url(b)):g(b)}),c.$$phase||c.$digest())});var l=0;c.$watch(function(){var a=d.url(),b=h.$$replace;l&&a==h.absUrl()||(l++,c.$evalAsync(function(){c.$broadcast("$locationChangeStart",h.absUrl(),a).defaultPrevented?h.$$parse(a):(d.url(h.absUrl(),b),g(a))}));h.$$replace=!1;return l});return h}]}function wd(){var b=!0,a=this;this.debugEnabled=
function(a){return v(a)?(b=a,this):b};this.$get=["$window",function(c){function d(a){a instanceof Error&&(a.stack?a=a.message&&-1===a.stack.indexOf(a.message)?"Error: "+a.message+"\n"+a.stack:a.stack:a.sourceURL&&(a=a.message+"\n"+a.sourceURL+":"+a.line));return a}function e(a){var b=c.console||{},e=b[a]||b.log||w;a=!1;try{a=!!e.apply}catch(n){}return a?function(){var a=[];r(arguments,function(b){a.push(d(b))});return e.apply(b,a)}:function(a,b){e(a,null==b?"":b)}}return{log:e("log"),info:e("info"),
warn:e("warn"),error:e("error"),debug:function(){var c=e("debug");return function(){b&&c.apply(a,arguments)}}()}}]}function ea(b,a){if("constructor"===b)throw ya("isecfld",a);return b}function Ya(b,a){if(b){if(b.constructor===b)throw ya("isecfn",a);if(b.document&&b.location&&b.alert&&b.setInterval)throw ya("isecwindow",a);if(b.children&&(b.nodeName||b.on&&b.find))throw ya("isecdom",a);}return b}function ob(b,a,c,d,e){e=e||{};a=a.split(".");for(var f,g=0;1<a.length;g++){f=ea(a.shift(),d);var h=b[f];
h||(h={},b[f]=h);b=h;b.then&&e.unwrapPromises&&(qa(d),"$$v"in b||function(a){a.then(function(b){a.$$v=b})}(b),b.$$v===s&&(b.$$v={}),b=b.$$v)}f=ea(a.shift(),d);return b[f]=c}function xc(b,a,c,d,e,f,g){ea(b,f);ea(a,f);ea(c,f);ea(d,f);ea(e,f);return g.unwrapPromises?function(h,g){var k=g&&g.hasOwnProperty(b)?g:h,l;if(null==k)return k;(k=k[b])&&k.then&&(qa(f),"$$v"in k||(l=k,l.$$v=s,l.then(function(a){l.$$v=a})),k=k.$$v);if(!a)return k;if(null==k)return s;(k=k[a])&&k.then&&(qa(f),"$$v"in k||(l=k,l.$$v=
s,l.then(function(a){l.$$v=a})),k=k.$$v);if(!c)return k;if(null==k)return s;(k=k[c])&&k.then&&(qa(f),"$$v"in k||(l=k,l.$$v=s,l.then(function(a){l.$$v=a})),k=k.$$v);if(!d)return k;if(null==k)return s;(k=k[d])&&k.then&&(qa(f),"$$v"in k||(l=k,l.$$v=s,l.then(function(a){l.$$v=a})),k=k.$$v);if(!e)return k;if(null==k)return s;(k=k[e])&&k.then&&(qa(f),"$$v"in k||(l=k,l.$$v=s,l.then(function(a){l.$$v=a})),k=k.$$v);return k}:function(f,g){var k=g&&g.hasOwnProperty(b)?g:f;if(null==k)return k;k=k[b];if(!a)return k;
if(null==k)return s;k=k[a];if(!c)return k;if(null==k)return s;k=k[c];if(!d)return k;if(null==k)return s;k=k[d];return e?null==k?s:k=k[e]:k}}function xd(b,a){ea(b,a);return function(a,d){return null==a?s:(d&&d.hasOwnProperty(b)?d:a)[b]}}function yd(b,a,c){ea(b,c);ea(a,c);return function(c,e){if(null==c)return s;c=(e&&e.hasOwnProperty(b)?e:c)[b];return null==c?s:c[a]}}function yc(b,a,c){if(Lb.hasOwnProperty(b))return Lb[b];var d=b.split("."),e=d.length,f;if(a.unwrapPromises||1!==e)if(a.unwrapPromises||
2!==e)if(a.csp)f=6>e?xc(d[0],d[1],d[2],d[3],d[4],c,a):function(b,f){var h=0,g;do g=xc(d[h++],d[h++],d[h++],d[h++],d[h++],c,a)(b,f),f=s,b=g;while(h<e);return g};else{var g="var p;\n";r(d,function(b,d){ea(b,c);g+="if(s == null) return undefined;\ns="+(d?"s":'((k&&k.hasOwnProperty("'+b+'"))?k:s)')+'["'+b+'"];\n'+(a.unwrapPromises?'if (s && s.then) {\n pw("'+c.replace(/(["\r\n])/g,"\\$1")+'");\n if (!("$$v" in s)) {\n p=s;\n p.$$v = undefined;\n p.then(function(v) {p.$$v=v;});\n}\n s=s.$$v\n}\n':"")});
var g=g+"return s;",h=new Function("s","k","pw",g);h.toString=aa(g);f=a.unwrapPromises?function(a,b){return h(a,b,qa)}:h}else f=yd(d[0],d[1],c);else f=xd(d[0],c);"hasOwnProperty"!==b&&(Lb[b]=f);return f}function zd(){var b={},a={csp:!1,unwrapPromises:!1,logPromiseWarnings:!0};this.unwrapPromises=function(b){return v(b)?(a.unwrapPromises=!!b,this):a.unwrapPromises};this.logPromiseWarnings=function(b){return v(b)?(a.logPromiseWarnings=b,this):a.logPromiseWarnings};this.$get=["$filter","$sniffer","$log",
function(c,d,e){a.csp=d.csp;qa=function(b){a.logPromiseWarnings&&!zc.hasOwnProperty(b)&&(zc[b]=!0,e.warn("[$parse] Promise found in the expression `"+b+"`. Automatic unwrapping of promises in Angular expressions is deprecated."))};return function(d){var e;switch(typeof d){case "string":if(b.hasOwnProperty(d))return b[d];e=new Mb(a);e=(new Za(e,c,a)).parse(d,!1);"hasOwnProperty"!==d&&(b[d]=e);return e;case "function":return d;default:return w}}}]}function Ad(){this.$get=["$rootScope","$exceptionHandler",
function(b,a){return Bd(function(a){b.$evalAsync(a)},a)}]}function Bd(b,a){function c(a){return a}function d(a){return g(a)}var e=function(){var g=[],k,l;return l={resolve:function(a){if(g){var c=g;g=s;k=f(a);c.length&&b(function(){for(var a,b=0,d=c.length;b<d;b++)a=c[b],k.then(a[0],a[1],a[2])})}},reject:function(a){l.resolve(h(a))},notify:function(a){if(g){var c=g;g.length&&b(function(){for(var b,d=0,e=c.length;d<e;d++)b=c[d],b[2](a)})}},promise:{then:function(b,f,h){var l=e(),B=function(d){try{l.resolve((N(b)?
b:c)(d))}catch(e){l.reject(e),a(e)}},I=function(b){try{l.resolve((N(f)?f:d)(b))}catch(c){l.reject(c),a(c)}},u=function(b){try{l.notify((N(h)?h:c)(b))}catch(d){a(d)}};g?g.push([B,I,u]):k.then(B,I,u);return l.promise},"catch":function(a){return this.then(null,a)},"finally":function(a){function b(a,c){var d=e();c?d.resolve(a):d.reject(a);return d.promise}function d(e,f){var h=null;try{h=(a||c)()}catch(g){return b(g,!1)}return h&&N(h.then)?h.then(function(){return b(e,f)},function(a){return b(a,!1)}):
b(e,f)}return this.then(function(a){return d(a,!0)},function(a){return d(a,!1)})}}}},f=function(a){return a&&N(a.then)?a:{then:function(c){var d=e();b(function(){d.resolve(c(a))});return d.promise}}},g=function(a){var b=e();b.reject(a);return b.promise},h=function(c){return{then:function(f,h){var g=e();b(function(){try{g.resolve((N(h)?h:d)(c))}catch(b){g.reject(b),a(b)}});return g.promise}}};return{defer:e,reject:g,when:function(h,k,l,m){var p=e(),q,A=function(b){try{return(N(k)?k:c)(b)}catch(d){return a(d),
g(d)}},B=function(b){try{return(N(l)?l:d)(b)}catch(c){return a(c),g(c)}},r=function(b){try{return(N(m)?m:c)(b)}catch(d){a(d)}};b(function(){f(h).then(function(a){q||(q=!0,p.resolve(f(a).then(A,B,r)))},function(a){q||(q=!0,p.resolve(B(a)))},function(a){q||p.notify(r(a))})});return p.promise},all:function(a){var b=e(),c=0,d=H(a)?[]:{};r(a,function(a,e){c++;f(a).then(function(a){d.hasOwnProperty(e)||(d[e]=a,--c||b.resolve(d))},function(a){d.hasOwnProperty(e)||b.reject(a)})});0===c&&b.resolve(d);return b.promise}}}
function Cd(){var b=10,a=E("$rootScope"),c=null;this.digestTtl=function(a){arguments.length&&(b=a);return b};this.$get=["$injector","$exceptionHandler","$parse","$browser",function(d,e,f,g){function h(){this.$id=$a();this.$$phase=this.$parent=this.$$watchers=this.$$nextSibling=this.$$prevSibling=this.$$childHead=this.$$childTail=null;this["this"]=this.$root=this;this.$$destroyed=!1;this.$$asyncQueue=[];this.$$postDigestQueue=[];this.$$listeners={};this.$$listenerCount={};this.$$isolateBindings={}}
function n(b){if(p.$$phase)throw a("inprog",p.$$phase);p.$$phase=b}function k(a,b){var c=f(a);Qa(c,b);return c}function l(a,b,c){do a.$$listenerCount[c]-=b,0===a.$$listenerCount[c]&&delete a.$$listenerCount[c];while(a=a.$parent)}function m(){}h.prototype={constructor:h,$new:function(a){a?(a=new h,a.$root=this.$root,a.$$asyncQueue=this.$$asyncQueue,a.$$postDigestQueue=this.$$postDigestQueue):(a=function(){},a.prototype=this,a=new a,a.$id=$a());a["this"]=a;a.$$listeners={};a.$$listenerCount={};a.$parent=
this;a.$$watchers=a.$$nextSibling=a.$$childHead=a.$$childTail=null;a.$$prevSibling=this.$$childTail;this.$$childHead?this.$$childTail=this.$$childTail.$$nextSibling=a:this.$$childHead=this.$$childTail=a;return a},$watch:function(a,b,d){var e=k(a,"watch"),f=this.$$watchers,h={fn:b,last:m,get:e,exp:a,eq:!!d};c=null;if(!N(b)){var g=k(b||w,"listener");h.fn=function(a,b,c){g(c)}}if("string"==typeof a&&e.constant){var n=h.fn;h.fn=function(a,b,c){n.call(this,a,b,c);Na(f,h)}}f||(f=this.$$watchers=[]);f.unshift(h);
return function(){Na(f,h);c=null}},$watchCollection:function(a,b){var c=this,d,e,h=0,g=f(a),k=[],n={},l=0;return this.$watch(function(){e=g(c);var a,b;if(Z(e))if(vb(e))for(d!==k&&(d=k,l=d.length=0,h++),a=e.length,l!==a&&(h++,d.length=l=a),b=0;b<a;b++)d[b]!==e[b]&&(h++,d[b]=e[b]);else{d!==n&&(d=n={},l=0,h++);a=0;for(b in e)e.hasOwnProperty(b)&&(a++,d.hasOwnProperty(b)?d[b]!==e[b]&&(h++,d[b]=e[b]):(l++,d[b]=e[b],h++));if(l>a)for(b in h++,d)d.hasOwnProperty(b)&&!e.hasOwnProperty(b)&&(l--,delete d[b])}else d!==
e&&(d=e,h++);return h},function(){b(e,d,c)})},$digest:function(){var d,f,h,g,k=this.$$asyncQueue,l=this.$$postDigestQueue,r,y,s=b,S,L=[],v,t,M;n("$digest");c=null;do{y=!1;for(S=this;k.length;){try{M=k.shift(),M.scope.$eval(M.expression)}catch(z){p.$$phase=null,e(z)}c=null}a:do{if(g=S.$$watchers)for(r=g.length;r--;)try{if(d=g[r])if((f=d.get(S))!==(h=d.last)&&!(d.eq?ta(f,h):"number"==typeof f&&"number"==typeof h&&isNaN(f)&&isNaN(h)))y=!0,c=d,d.last=d.eq?ca(f):f,d.fn(f,h===m?f:h,S),5>s&&(v=4-s,L[v]||
(L[v]=[]),t=N(d.exp)?"fn: "+(d.exp.name||d.exp.toString()):d.exp,t+="; newVal: "+oa(f)+"; oldVal: "+oa(h),L[v].push(t));else if(d===c){y=!1;break a}}catch(D){p.$$phase=null,e(D)}if(!(g=S.$$childHead||S!==this&&S.$$nextSibling))for(;S!==this&&!(g=S.$$nextSibling);)S=S.$parent}while(S=g);if((y||k.length)&&!s--)throw p.$$phase=null,a("infdig",b,oa(L));}while(y||k.length);for(p.$$phase=null;l.length;)try{l.shift()()}catch(w){e(w)}},$destroy:function(){if(!this.$$destroyed){var a=this.$parent;this.$broadcast("$destroy");
this.$$destroyed=!0;this!==p&&(r(this.$$listenerCount,cb(null,l,this)),a.$$childHead==this&&(a.$$childHead=this.$$nextSibling),a.$$childTail==this&&(a.$$childTail=this.$$prevSibling),this.$$prevSibling&&(this.$$prevSibling.$$nextSibling=this.$$nextSibling),this.$$nextSibling&&(this.$$nextSibling.$$prevSibling=this.$$prevSibling),this.$parent=this.$$nextSibling=this.$$prevSibling=this.$$childHead=this.$$childTail=null)}},$eval:function(a,b){return f(a)(this,b)},$evalAsync:function(a){p.$$phase||p.$$asyncQueue.length||
g.defer(function(){p.$$asyncQueue.length&&p.$digest()});this.$$asyncQueue.push({scope:this,expression:a})},$$postDigest:function(a){this.$$postDigestQueue.push(a)},$apply:function(a){try{return n("$apply"),this.$eval(a)}catch(b){e(b)}finally{p.$$phase=null;try{p.$digest()}catch(c){throw e(c),c;}}},$on:function(a,b){var c=this.$$listeners[a];c||(this.$$listeners[a]=c=[]);c.push(b);var d=this;do d.$$listenerCount[a]||(d.$$listenerCount[a]=0),d.$$listenerCount[a]++;while(d=d.$parent);var e=this;return function(){c[bb(c,
b)]=null;l(e,1,a)}},$emit:function(a,b){var c=[],d,f=this,h=!1,g={name:a,targetScope:f,stopPropagation:function(){h=!0},preventDefault:function(){g.defaultPrevented=!0},defaultPrevented:!1},k=[g].concat(ua.call(arguments,1)),n,l;do{d=f.$$listeners[a]||c;g.currentScope=f;n=0;for(l=d.length;n<l;n++)if(d[n])try{d[n].apply(null,k)}catch(p){e(p)}else d.splice(n,1),n--,l--;if(h)break;f=f.$parent}while(f);return g},$broadcast:function(a,b){for(var c=this,d=this,f={name:a,targetScope:this,preventDefault:function(){f.defaultPrevented=
!0},defaultPrevented:!1},h=[f].concat(ua.call(arguments,1)),g,k;c=d;){f.currentScope=c;d=c.$$listeners[a]||[];g=0;for(k=d.length;g<k;g++)if(d[g])try{d[g].apply(null,h)}catch(n){e(n)}else d.splice(g,1),g--,k--;if(!(d=c.$$listenerCount[a]&&c.$$childHead||c!==this&&c.$$nextSibling))for(;c!==this&&!(d=c.$$nextSibling);)c=c.$parent}return f}};var p=new h;return p}]}function Dd(){var b=/^\s*(https?|ftp|mailto|tel|file):/,a=/^\s*(https?|ftp|file):|data:image\//;this.aHrefSanitizationWhitelist=function(a){return v(a)?
(b=a,this):b};this.imgSrcSanitizationWhitelist=function(b){return v(b)?(a=b,this):a};this.$get=function(){return function(c,d){var e=d?a:b,f;if(!P||8<=P)if(f=xa(c).href,""!==f&&!f.match(e))return"unsafe:"+f;return c}}}function Ed(b){if("self"===b)return b;if(D(b)){if(-1<b.indexOf("***"))throw ra("iwcard",b);b=b.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g,"\\$1").replace(/\x08/g,"\\x08").replace("\\*\\*",".*").replace("\\*","[^:/.?&;]*");return RegExp("^"+b+"$")}if(ab(b))return RegExp("^"+b.source+"$");
throw ra("imatcher");}function Ac(b){var a=[];v(b)&&r(b,function(b){a.push(Ed(b))});return a}function Fd(){this.SCE_CONTEXTS=fa;var b=["self"],a=[];this.resourceUrlWhitelist=function(a){arguments.length&&(b=Ac(a));return b};this.resourceUrlBlacklist=function(b){arguments.length&&(a=Ac(b));return a};this.$get=["$injector",function(c){function d(a){var b=function(a){this.$$unwrapTrustedValue=function(){return a}};a&&(b.prototype=new a);b.prototype.valueOf=function(){return this.$$unwrapTrustedValue()};
b.prototype.toString=function(){return this.$$unwrapTrustedValue().toString()};return b}var e=function(a){throw ra("unsafe");};c.has("$sanitize")&&(e=c.get("$sanitize"));var f=d(),g={};g[fa.HTML]=d(f);g[fa.CSS]=d(f);g[fa.URL]=d(f);g[fa.JS]=d(f);g[fa.RESOURCE_URL]=d(g[fa.URL]);return{trustAs:function(a,b){var c=g.hasOwnProperty(a)?g[a]:null;if(!c)throw ra("icontext",a,b);if(null===b||b===s||""===b)return b;if("string"!==typeof b)throw ra("itype",a);return new c(b)},getTrusted:function(c,d){if(null===
d||d===s||""===d)return d;var f=g.hasOwnProperty(c)?g[c]:null;if(f&&d instanceof f)return d.$$unwrapTrustedValue();if(c===fa.RESOURCE_URL){var f=xa(d.toString()),l,m,p=!1;l=0;for(m=b.length;l<m;l++)if("self"===b[l]?Hb(f):b[l].exec(f.href)){p=!0;break}if(p)for(l=0,m=a.length;l<m;l++)if("self"===a[l]?Hb(f):a[l].exec(f.href)){p=!1;break}if(p)return d;throw ra("insecurl",d.toString());}if(c===fa.HTML)return e(d);throw ra("unsafe");},valueOf:function(a){return a instanceof f?a.$$unwrapTrustedValue():a}}}]}
function Gd(){var b=!0;this.enabled=function(a){arguments.length&&(b=!!a);return b};this.$get=["$parse","$sniffer","$sceDelegate",function(a,c,d){if(b&&c.msie&&8>c.msieDocumentMode)throw ra("iequirks");var e=ca(fa);e.isEnabled=function(){return b};e.trustAs=d.trustAs;e.getTrusted=d.getTrusted;e.valueOf=d.valueOf;b||(e.trustAs=e.getTrusted=function(a,b){return b},e.valueOf=Aa);e.parseAs=function(b,c){var d=a(c);return d.literal&&d.constant?d:function(a,c){return e.getTrusted(b,d(a,c))}};var f=e.parseAs,
g=e.getTrusted,h=e.trustAs;r(fa,function(a,b){var c=O(b);e[Ra("parse_as_"+c)]=function(b){return f(a,b)};e[Ra("get_trusted_"+c)]=function(b){return g(a,b)};e[Ra("trust_as_"+c)]=function(b){return h(a,b)}});return e}]}function Hd(){this.$get=["$window","$document",function(b,a){var c={},d=Q((/android (\d+)/.exec(O((b.navigator||{}).userAgent))||[])[1]),e=/Boxee/i.test((b.navigator||{}).userAgent),f=a[0]||{},g=f.documentMode,h,n=/^(Moz|webkit|O|ms)(?=[A-Z])/,k=f.body&&f.body.style,l=!1,m=!1;if(k){for(var p in k)if(l=
n.exec(p)){h=l[0];h=h.substr(0,1).toUpperCase()+h.substr(1);break}h||(h="WebkitOpacity"in k&&"webkit");l=!!("transition"in k||h+"Transition"in k);m=!!("animation"in k||h+"Animation"in k);!d||l&&m||(l=D(f.body.style.webkitTransition),m=D(f.body.style.webkitAnimation))}return{history:!(!b.history||!b.history.pushState||4>d||e),hashchange:"onhashchange"in b&&(!g||7<g),hasEvent:function(a){if("input"==a&&9==P)return!1;if(x(c[a])){var b=f.createElement("div");c[a]="on"+a in b}return c[a]},csp:Vb(),vendorPrefix:h,
transitions:l,animations:m,android:d,msie:P,msieDocumentMode:g}}]}function Id(){this.$get=["$rootScope","$browser","$q","$exceptionHandler",function(b,a,c,d){function e(e,h,n){var k=c.defer(),l=k.promise,m=v(n)&&!n;h=a.defer(function(){try{k.resolve(e())}catch(a){k.reject(a),d(a)}finally{delete f[l.$$timeoutId]}m||b.$apply()},h);l.$$timeoutId=h;f[h]=k;return l}var f={};e.cancel=function(b){return b&&b.$$timeoutId in f?(f[b.$$timeoutId].reject("canceled"),delete f[b.$$timeoutId],a.defer.cancel(b.$$timeoutId)):
!1};return e}]}function xa(b,a){var c=b;P&&(V.setAttribute("href",c),c=V.href);V.setAttribute("href",c);return{href:V.href,protocol:V.protocol?V.protocol.replace(/:$/,""):"",host:V.host,search:V.search?V.search.replace(/^\?/,""):"",hash:V.hash?V.hash.replace(/^#/,""):"",hostname:V.hostname,port:V.port,pathname:"/"===V.pathname.charAt(0)?V.pathname:"/"+V.pathname}}function Hb(b){b=D(b)?xa(b):b;return b.protocol===Bc.protocol&&b.host===Bc.host}function Jd(){this.$get=aa(C)}function Cc(b){function a(d,
e){if(Z(d)){var f={};r(d,function(b,c){f[c]=a(c,b)});return f}return b.factory(d+c,e)}var c="Filter";this.register=a;this.$get=["$injector",function(a){return function(b){return a.get(b+c)}}];a("currency",Dc);a("date",Ec);a("filter",Kd);a("json",Ld);a("limitTo",Md);a("lowercase",Nd);a("number",Fc);a("orderBy",Gc);a("uppercase",Od)}function Kd(){return function(b,a,c){if(!H(b))return b;var d=typeof c,e=[];e.check=function(a){for(var b=0;b<e.length;b++)if(!e[b](a))return!1;return!0};"function"!==d&&
(c="boolean"===d&&c?function(a,b){return Ba.equals(a,b)}:function(a,b){if(a&&b&&"object"===typeof a&&"object"===typeof b){for(var d in a)if("$"!==d.charAt(0)&&Pd.call(a,d)&&c(a[d],b[d]))return!0;return!1}b=(""+b).toLowerCase();return-1<(""+a).toLowerCase().indexOf(b)});var f=function(a,b){if("string"==typeof b&&"!"===b.charAt(0))return!f(a,b.substr(1));switch(typeof a){case "boolean":case "number":case "string":return c(a,b);case "object":switch(typeof b){case "object":return c(a,b);default:for(var d in a)if("$"!==
d.charAt(0)&&f(a[d],b))return!0}return!1;case "array":for(d=0;d<a.length;d++)if(f(a[d],b))return!0;return!1;default:return!1}};switch(typeof a){case "boolean":case "number":case "string":a={$:a};case "object":for(var g in a)(function(b){"undefined"!=typeof a[b]&&e.push(function(c){return f("$"==b?c:c&&c[b],a[b])})})(g);break;case "function":e.push(a);break;default:return b}d=[];for(g=0;g<b.length;g++){var h=b[g];e.check(h)&&d.push(h)}return d}}function Dc(b){var a=b.NUMBER_FORMATS;return function(b,
d){x(d)&&(d=a.CURRENCY_SYM);return Hc(b,a.PATTERNS[1],a.GROUP_SEP,a.DECIMAL_SEP,2).replace(/\u00A4/g,d)}}function Fc(b){var a=b.NUMBER_FORMATS;return function(b,d){return Hc(b,a.PATTERNS[0],a.GROUP_SEP,a.DECIMAL_SEP,d)}}function Hc(b,a,c,d,e){if(isNaN(b)||!isFinite(b))return"";var f=0>b;b=Math.abs(b);var g=b+"",h="",n=[],k=!1;if(-1!==g.indexOf("e")){var l=g.match(/([\d\.]+)e(-?)(\d+)/);l&&"-"==l[2]&&l[3]>e+1?g="0":(h=g,k=!0)}if(k)0<e&&(-1<b&&1>b)&&(h=b.toFixed(e));else{g=(g.split(Ic)[1]||"").length;
x(e)&&(e=Math.min(Math.max(a.minFrac,g),a.maxFrac));g=Math.pow(10,e);b=Math.round(b*g)/g;b=(""+b).split(Ic);g=b[0];b=b[1]||"";var l=0,m=a.lgSize,p=a.gSize;if(g.length>=m+p)for(l=g.length-m,k=0;k<l;k++)0===(l-k)%p&&0!==k&&(h+=c),h+=g.charAt(k);for(k=l;k<g.length;k++)0===(g.length-k)%m&&0!==k&&(h+=c),h+=g.charAt(k);for(;b.length<e;)b+="0";e&&"0"!==e&&(h+=d+b.substr(0,e))}n.push(f?a.negPre:a.posPre);n.push(h);n.push(f?a.negSuf:a.posSuf);return n.join("")}function Nb(b,a,c){var d="";0>b&&(d="-",b=-b);
for(b=""+b;b.length<a;)b="0"+b;c&&(b=b.substr(b.length-a));return d+b}function $(b,a,c,d){c=c||0;return function(e){e=e["get"+b]();if(0<c||e>-c)e+=c;0===e&&-12==c&&(e=12);return Nb(e,a,d)}}function pb(b,a){return function(c,d){var e=c["get"+b](),f=Ia(a?"SHORT"+b:b);return d[f][e]}}function Ec(b){function a(a){var b;if(b=a.match(c)){a=new Date(0);var f=0,g=0,h=b[8]?a.setUTCFullYear:a.setFullYear,n=b[8]?a.setUTCHours:a.setHours;b[9]&&(f=Q(b[9]+b[10]),g=Q(b[9]+b[11]));h.call(a,Q(b[1]),Q(b[2])-1,Q(b[3]));
f=Q(b[4]||0)-f;g=Q(b[5]||0)-g;h=Q(b[6]||0);b=Math.round(1E3*parseFloat("0."+(b[7]||0)));n.call(a,f,g,h,b)}return a}var c=/^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;return function(c,e){var f="",g=[],h,n;e=e||"mediumDate";e=b.DATETIME_FORMATS[e]||e;D(c)&&(c=Qd.test(c)?Q(c):a(c));wb(c)&&(c=new Date(c));if(!La(c))return c;for(;e;)(n=Rd.exec(e))?(g=g.concat(ua.call(n,1)),e=g.pop()):(g.push(e),e=null);r(g,function(a){h=Sd[a];f+=h?h(c,b.DATETIME_FORMATS):
a.replace(/(^'|'$)/g,"").replace(/''/g,"'")});return f}}function Ld(){return function(b){return oa(b,!0)}}function Md(){return function(b,a){if(!H(b)&&!D(b))return b;a=Q(a);if(D(b))return a?0<=a?b.slice(0,a):b.slice(a,b.length):"";var c=[],d,e;a>b.length?a=b.length:a<-b.length&&(a=-b.length);0<a?(d=0,e=a):(d=b.length+a,e=b.length);for(;d<e;d++)c.push(b[d]);return c}}function Gc(b){return function(a,c,d){function e(a,b){return Pa(b)?function(b,c){return a(c,b)}:a}if(!H(a)||!c)return a;c=H(c)?c:[c];
c=Sc(c,function(a){var c=!1,d=a||Aa;if(D(a)){if("+"==a.charAt(0)||"-"==a.charAt(0))c="-"==a.charAt(0),a=a.substring(1);d=b(a)}return e(function(a,b){var c;c=d(a);var e=d(b),f=typeof c,h=typeof e;f==h?("string"==f&&(c=c.toLowerCase(),e=e.toLowerCase()),c=c===e?0:c<e?-1:1):c=f<h?-1:1;return c},c)});for(var f=[],g=0;g<a.length;g++)f.push(a[g]);return f.sort(e(function(a,b){for(var d=0;d<c.length;d++){var e=c[d](a,b);if(0!==e)return e}return 0},d))}}function sa(b){N(b)&&(b={link:b});b.restrict=b.restrict||
"AC";return aa(b)}function Jc(b,a){function c(a,c){c=c?"-"+db(c,"-"):"";b.removeClass((a?qb:rb)+c).addClass((a?rb:qb)+c)}var d=this,e=b.parent().controller("form")||sb,f=0,g=d.$error={},h=[];d.$name=a.name||a.ngForm;d.$dirty=!1;d.$pristine=!0;d.$valid=!0;d.$invalid=!1;e.$addControl(d);b.addClass(Ja);c(!0);d.$addControl=function(a){wa(a.$name,"input");h.push(a);a.$name&&(d[a.$name]=a)};d.$removeControl=function(a){a.$name&&d[a.$name]===a&&delete d[a.$name];r(g,function(b,c){d.$setValidity(c,!0,a)});
Na(h,a)};d.$setValidity=function(a,b,h){var m=g[a];if(b)m&&(Na(m,h),m.length||(f--,f||(c(b),d.$valid=!0,d.$invalid=!1),g[a]=!1,c(!0,a),e.$setValidity(a,!0,d)));else{f||c(b);if(m){if(-1!=bb(m,h))return}else g[a]=m=[],f++,c(!1,a),e.$setValidity(a,!1,d);m.push(h);d.$valid=!1;d.$invalid=!0}};d.$setDirty=function(){b.removeClass(Ja).addClass(tb);d.$dirty=!0;d.$pristine=!1;e.$setDirty()};d.$setPristine=function(){b.removeClass(tb).addClass(Ja);d.$dirty=!1;d.$pristine=!0;r(h,function(a){a.$setPristine()})}}
function na(b,a,c,d){b.$setValidity(a,c);return c?d:s}function ub(b,a,c,d,e,f){if(!e.android){var g=!1;a.on("compositionstart",function(a){g=!0});a.on("compositionend",function(){g=!1;h()})}var h=function(){if(!g){var e=a.val();Pa(c.ngTrim||"T")&&(e=da(e));d.$viewValue!==e&&(b.$$phase?d.$setViewValue(e):b.$apply(function(){d.$setViewValue(e)}))}};if(e.hasEvent("input"))a.on("input",h);else{var n,k=function(){n||(n=f.defer(function(){h();n=null}))};a.on("keydown",function(a){a=a.keyCode;91===a||(15<
a&&19>a||37<=a&&40>=a)||k()});if(e.hasEvent("paste"))a.on("paste cut",k)}a.on("change",h);d.$render=function(){a.val(d.$isEmpty(d.$viewValue)?"":d.$viewValue)};var l=c.ngPattern;l&&((e=l.match(/^\/(.*)\/([gim]*)$/))?(l=RegExp(e[1],e[2]),e=function(a){return na(d,"pattern",d.$isEmpty(a)||l.test(a),a)}):e=function(c){var e=b.$eval(l);if(!e||!e.test)throw E("ngPattern")("noregexp",l,e,ga(a));return na(d,"pattern",d.$isEmpty(c)||e.test(c),c)},d.$formatters.push(e),d.$parsers.push(e));if(c.ngMinlength){var m=
Q(c.ngMinlength);e=function(a){return na(d,"minlength",d.$isEmpty(a)||a.length>=m,a)};d.$parsers.push(e);d.$formatters.push(e)}if(c.ngMaxlength){var p=Q(c.ngMaxlength);e=function(a){return na(d,"maxlength",d.$isEmpty(a)||a.length<=p,a)};d.$parsers.push(e);d.$formatters.push(e)}}function Ob(b,a){b="ngClass"+b;return function(){return{restrict:"AC",link:function(c,d,e){function f(b){if(!0===a||c.$index%2===a){var d=g(b||"");h?ta(b,h)||e.$updateClass(d,g(h)):e.$addClass(d)}h=ca(b)}function g(a){if(H(a))return a.join(" ");
if(Z(a)){var b=[];r(a,function(a,c){a&&b.push(c)});return b.join(" ")}return a}var h;c.$watch(e[b],f,!0);e.$observe("class",function(a){f(c.$eval(e[b]))});"ngClass"!==b&&c.$watch("$index",function(d,f){var h=d&1;if(h!==f&1){var m=g(c.$eval(e[b]));h===a?e.$addClass(m):e.$removeClass(m)}})}}}}var O=function(b){return D(b)?b.toLowerCase():b},Pd=Object.prototype.hasOwnProperty,Ia=function(b){return D(b)?b.toUpperCase():b},P,z,Ca,ua=[].slice,Td=[].push,Ma=Object.prototype.toString,Oa=E("ng"),Ba=C.angular||
(C.angular={}),Va,Ga,ja=["0","0","0"];P=Q((/msie (\d+)/.exec(O(navigator.userAgent))||[])[1]);isNaN(P)&&(P=Q((/trident\/.*; rv:(\d+)/.exec(O(navigator.userAgent))||[])[1]));w.$inject=[];Aa.$inject=[];var da=function(){return String.prototype.trim?function(b){return D(b)?b.trim():b}:function(b){return D(b)?b.replace(/^\s\s*/,"").replace(/\s\s*$/,""):b}}();Ga=9>P?function(b){b=b.nodeName?b:b[0];return b.scopeName&&"HTML"!=b.scopeName?Ia(b.scopeName+":"+b.nodeName):b.nodeName}:function(b){return b.nodeName?
b.nodeName:b[0].nodeName};var Vc=/[A-Z]/g,Ud={full:"1.2.13",major:1,minor:2,dot:13,codeName:"romantic-transclusion"},Sa=R.cache={},eb=R.expando="ng-"+(new Date).getTime(),Zc=1,Kc=C.document.addEventListener?function(b,a,c){b.addEventListener(a,c,!1)}:function(b,a,c){b.attachEvent("on"+a,c)},Eb=C.document.removeEventListener?function(b,a,c){b.removeEventListener(a,c,!1)}:function(b,a,c){b.detachEvent("on"+a,c)};R._data=function(b){return this.cache[b[this.expando]]||{}};var Xc=/([\:\-\_]+(.))/g,Yc=
/^moz([A-Z])/,Bb=E("jqLite"),Fa=R.prototype={ready:function(b){function a(){c||(c=!0,b())}var c=!1;"complete"===T.readyState?setTimeout(a):(this.on("DOMContentLoaded",a),R(C).on("load",a))},toString:function(){var b=[];r(this,function(a){b.push(""+a)});return"["+b.join(", ")+"]"},eq:function(b){return 0<=b?z(this[b]):z(this[this.length+b])},length:0,push:Td,sort:[].sort,splice:[].splice},ib={};r("multiple selected checked disabled readOnly required open".split(" "),function(b){ib[O(b)]=b});var ic=
{};r("input select option textarea button form details".split(" "),function(b){ic[Ia(b)]=!0});r({data:ec,inheritedData:hb,scope:function(b){return z(b).data("$scope")||hb(b.parentNode||b,["$isolateScope","$scope"])},isolateScope:function(b){return z(b).data("$isolateScope")||z(b).data("$isolateScopeNoTemplate")},controller:fc,injector:function(b){return hb(b,"$injector")},removeAttr:function(b,a){b.removeAttribute(a)},hasClass:Fb,css:function(b,a,c){a=Ra(a);if(v(c))b.style[a]=c;else{var d;8>=P&&(d=
b.currentStyle&&b.currentStyle[a],""===d&&(d="auto"));d=d||b.style[a];8>=P&&(d=""===d?s:d);return d}},attr:function(b,a,c){var d=O(a);if(ib[d])if(v(c))c?(b[a]=!0,b.setAttribute(a,d)):(b[a]=!1,b.removeAttribute(d));else return b[a]||(b.attributes.getNamedItem(a)||w).specified?d:s;else if(v(c))b.setAttribute(a,c);else if(b.getAttribute)return b=b.getAttribute(a,2),null===b?s:b},prop:function(b,a,c){if(v(c))b[a]=c;else return b[a]},text:function(){function b(b,d){var e=a[b.nodeType];if(x(d))return e?
b[e]:"";b[e]=d}var a=[];9>P?(a[1]="innerText",a[3]="nodeValue"):a[1]=a[3]="textContent";b.$dv="";return b}(),val:function(b,a){if(x(a)){if("SELECT"===Ga(b)&&b.multiple){var c=[];r(b.options,function(a){a.selected&&c.push(a.value||a.text)});return 0===c.length?null:c}return b.value}b.value=a},html:function(b,a){if(x(a))return b.innerHTML;for(var c=0,d=b.childNodes;c<d.length;c++)Da(d[c]);b.innerHTML=a},empty:gc},function(b,a){R.prototype[a]=function(a,d){var e,f;if(b!==gc&&(2==b.length&&b!==Fb&&b!==
fc?a:d)===s){if(Z(a)){for(e=0;e<this.length;e++)if(b===ec)b(this[e],a);else for(f in a)b(this[e],f,a[f]);return this}e=b.$dv;f=e===s?Math.min(this.length,1):this.length;for(var g=0;g<f;g++){var h=b(this[g],a,d);e=e?e+h:h}return e}for(e=0;e<this.length;e++)b(this[e],a,d);return this}});r({removeData:cc,dealoc:Da,on:function a(c,d,e,f){if(v(f))throw Bb("onargs");var g=ka(c,"events"),h=ka(c,"handle");g||ka(c,"events",g={});h||ka(c,"handle",h=$c(c,g));r(d.split(" "),function(d){var f=g[d];if(!f){if("mouseenter"==
d||"mouseleave"==d){var l=T.body.contains||T.body.compareDocumentPosition?function(a,c){var d=9===a.nodeType?a.documentElement:a,e=c&&c.parentNode;return a===e||!!(e&&1===e.nodeType&&(d.contains?d.contains(e):a.compareDocumentPosition&&a.compareDocumentPosition(e)&16))}:function(a,c){if(c)for(;c=c.parentNode;)if(c===a)return!0;return!1};g[d]=[];a(c,{mouseleave:"mouseout",mouseenter:"mouseover"}[d],function(a){var c=a.relatedTarget;c&&(c===this||l(this,c))||h(a,d)})}else Kc(c,d,h),g[d]=[];f=g[d]}f.push(e)})},
off:dc,one:function(a,c,d){a=z(a);a.on(c,function f(){a.off(c,d);a.off(c,f)});a.on(c,d)},replaceWith:function(a,c){var d,e=a.parentNode;Da(a);r(new R(c),function(c){d?e.insertBefore(c,d.nextSibling):e.replaceChild(c,a);d=c})},children:function(a){var c=[];r(a.childNodes,function(a){1===a.nodeType&&c.push(a)});return c},contents:function(a){return a.childNodes||[]},append:function(a,c){r(new R(c),function(c){1!==a.nodeType&&11!==a.nodeType||a.appendChild(c)})},prepend:function(a,c){if(1===a.nodeType){var d=
a.firstChild;r(new R(c),function(c){a.insertBefore(c,d)})}},wrap:function(a,c){c=z(c)[0];var d=a.parentNode;d&&d.replaceChild(c,a);c.appendChild(a)},remove:function(a){Da(a);var c=a.parentNode;c&&c.removeChild(a)},after:function(a,c){var d=a,e=a.parentNode;r(new R(c),function(a){e.insertBefore(a,d.nextSibling);d=a})},addClass:gb,removeClass:fb,toggleClass:function(a,c,d){x(d)&&(d=!Fb(a,c));(d?gb:fb)(a,c)},parent:function(a){return(a=a.parentNode)&&11!==a.nodeType?a:null},next:function(a){if(a.nextElementSibling)return a.nextElementSibling;
for(a=a.nextSibling;null!=a&&1!==a.nodeType;)a=a.nextSibling;return a},find:function(a,c){return a.getElementsByTagName?a.getElementsByTagName(c):[]},clone:Db,triggerHandler:function(a,c,d){c=(ka(a,"events")||{})[c];d=d||[];var e=[{preventDefault:w,stopPropagation:w}];r(c,function(c){c.apply(a,e.concat(d))})}},function(a,c){R.prototype[c]=function(c,e,f){for(var g,h=0;h<this.length;h++)x(g)?(g=a(this[h],c,e,f),v(g)&&(g=z(g))):Cb(g,a(this[h],c,e,f));return v(g)?g:this};R.prototype.bind=R.prototype.on;
R.prototype.unbind=R.prototype.off});Ta.prototype={put:function(a,c){this[Ea(a)]=c},get:function(a){return this[Ea(a)]},remove:function(a){var c=this[a=Ea(a)];delete this[a];return c}};var bd=/^function\s*[^\(]*\(\s*([^\)]*)\)/m,cd=/,/,dd=/^\s*(_?)(\S+?)\1\s*$/,ad=/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,Ua=E("$injector"),Vd=E("$animate"),Wd=["$provide",function(a){this.$$selectors={};this.register=function(c,d){var e=c+"-animation";if(c&&"."!=c.charAt(0))throw Vd("notcsel",c);this.$$selectors[c.substr(1)]=
e;a.factory(e,d)};this.classNameFilter=function(a){1===arguments.length&&(this.$$classNameFilter=a instanceof RegExp?a:null);return this.$$classNameFilter};this.$get=["$timeout",function(a){return{enter:function(d,e,f,g){f?f.after(d):(e&&e[0]||(e=f.parent()),e.append(d));g&&a(g,0,!1)},leave:function(d,e){d.remove();e&&a(e,0,!1)},move:function(a,c,f,g){this.enter(a,c,f,g)},addClass:function(d,e,f){e=D(e)?e:H(e)?e.join(" "):"";r(d,function(a){gb(a,e)});f&&a(f,0,!1)},removeClass:function(d,e,f){e=D(e)?
e:H(e)?e.join(" "):"";r(d,function(a){fb(a,e)});f&&a(f,0,!1)},setClass:function(d,e,f,g){r(d,function(a){gb(a,e);fb(a,f)});g&&a(g,0,!1)},enabled:w}}]}],ia=E("$compile");kc.$inject=["$provide","$$sanitizeUriProvider"];var jd=/^(x[\:\-_]|data[\:\-_])/i,qc=E("$interpolate"),Xd=/^([^\?#]*)(\?([^#]*))?(#(.*))?$/,ud={http:80,https:443,ftp:21},Jb=E("$location");vc.prototype=Kb.prototype=uc.prototype={$$html5:!1,$$replace:!1,absUrl:nb("$$absUrl"),url:function(a,c){if(x(a))return this.$$url;var d=Xd.exec(a);
d[1]&&this.path(decodeURIComponent(d[1]));(d[2]||d[1])&&this.search(d[3]||"");this.hash(d[5]||"",c);return this},protocol:nb("$$protocol"),host:nb("$$host"),port:nb("$$port"),path:wc("$$path",function(a){return"/"==a.charAt(0)?a:"/"+a}),search:function(a,c){switch(arguments.length){case 0:return this.$$search;case 1:if(D(a))this.$$search=Yb(a);else if(Z(a))this.$$search=a;else throw Jb("isrcharg");break;default:x(c)||null===c?delete this.$$search[a]:this.$$search[a]=c}this.$$compose();return this},
hash:wc("$$hash",Aa),replace:function(){this.$$replace=!0;return this}};var ya=E("$parse"),zc={},qa,Ka={"null":function(){return null},"true":function(){return!0},"false":function(){return!1},undefined:w,"+":function(a,c,d,e){d=d(a,c);e=e(a,c);return v(d)?v(e)?d+e:d:v(e)?e:s},"-":function(a,c,d,e){d=d(a,c);e=e(a,c);return(v(d)?d:0)-(v(e)?e:0)},"*":function(a,c,d,e){return d(a,c)*e(a,c)},"/":function(a,c,d,e){return d(a,c)/e(a,c)},"%":function(a,c,d,e){return d(a,c)%e(a,c)},"^":function(a,c,d,e){return d(a,
c)^e(a,c)},"=":w,"===":function(a,c,d,e){return d(a,c)===e(a,c)},"!==":function(a,c,d,e){return d(a,c)!==e(a,c)},"==":function(a,c,d,e){return d(a,c)==e(a,c)},"!=":function(a,c,d,e){return d(a,c)!=e(a,c)},"<":function(a,c,d,e){return d(a,c)<e(a,c)},">":function(a,c,d,e){return d(a,c)>e(a,c)},"<=":function(a,c,d,e){return d(a,c)<=e(a,c)},">=":function(a,c,d,e){return d(a,c)>=e(a,c)},"&&":function(a,c,d,e){return d(a,c)&&e(a,c)},"||":function(a,c,d,e){return d(a,c)||e(a,c)},"&":function(a,c,d,e){return d(a,
c)&e(a,c)},"|":function(a,c,d,e){return e(a,c)(a,c,d(a,c))},"!":function(a,c,d){return!d(a,c)}},Yd={n:"\n",f:"\f",r:"\r",t:"\t",v:"\v","'":"'",'"':'"'},Mb=function(a){this.options=a};Mb.prototype={constructor:Mb,lex:function(a){this.text=a;this.index=0;this.ch=s;this.lastCh=":";this.tokens=[];var c;for(a=[];this.index<this.text.length;){this.ch=this.text.charAt(this.index);if(this.is("\"'"))this.readString(this.ch);else if(this.isNumber(this.ch)||this.is(".")&&this.isNumber(this.peek()))this.readNumber();
else if(this.isIdent(this.ch))this.readIdent(),this.was("{,")&&("{"===a[0]&&(c=this.tokens[this.tokens.length-1]))&&(c.json=-1===c.text.indexOf("."));else if(this.is("(){}[].,;:?"))this.tokens.push({index:this.index,text:this.ch,json:this.was(":[,")&&this.is("{[")||this.is("}]:,")}),this.is("{[")&&a.unshift(this.ch),this.is("}]")&&a.shift(),this.index++;else if(this.isWhitespace(this.ch)){this.index++;continue}else{var d=this.ch+this.peek(),e=d+this.peek(2),f=Ka[this.ch],g=Ka[d],h=Ka[e];h?(this.tokens.push({index:this.index,
text:e,fn:h}),this.index+=3):g?(this.tokens.push({index:this.index,text:d,fn:g}),this.index+=2):f?(this.tokens.push({index:this.index,text:this.ch,fn:f,json:this.was("[,:")&&this.is("+-")}),this.index+=1):this.throwError("Unexpected next character ",this.index,this.index+1)}this.lastCh=this.ch}return this.tokens},is:function(a){return-1!==a.indexOf(this.ch)},was:function(a){return-1!==a.indexOf(this.lastCh)},peek:function(a){a=a||1;return this.index+a<this.text.length?this.text.charAt(this.index+
a):!1},isNumber:function(a){return"0"<=a&&"9">=a},isWhitespace:function(a){return" "===a||"\r"===a||"\t"===a||"\n"===a||"\v"===a||"\u00a0"===a},isIdent:function(a){return"a"<=a&&"z">=a||"A"<=a&&"Z">=a||"_"===a||"$"===a},isExpOperator:function(a){return"-"===a||"+"===a||this.isNumber(a)},throwError:function(a,c,d){d=d||this.index;c=v(c)?"s "+c+"-"+this.index+" ["+this.text.substring(c,d)+"]":" "+d;throw ya("lexerr",a,c,this.text);},readNumber:function(){for(var a="",c=this.index;this.index<this.text.length;){var d=
O(this.text.charAt(this.index));if("."==d||this.isNumber(d))a+=d;else{var e=this.peek();if("e"==d&&this.isExpOperator(e))a+=d;else if(this.isExpOperator(d)&&e&&this.isNumber(e)&&"e"==a.charAt(a.length-1))a+=d;else if(!this.isExpOperator(d)||e&&this.isNumber(e)||"e"!=a.charAt(a.length-1))break;else this.throwError("Invalid exponent")}this.index++}a*=1;this.tokens.push({index:c,text:a,json:!0,fn:function(){return a}})},readIdent:function(){for(var a=this,c="",d=this.index,e,f,g,h;this.index<this.text.length;){h=
this.text.charAt(this.index);if("."===h||this.isIdent(h)||this.isNumber(h))"."===h&&(e=this.index),c+=h;else break;this.index++}if(e)for(f=this.index;f<this.text.length;){h=this.text.charAt(f);if("("===h){g=c.substr(e-d+1);c=c.substr(0,e-d);this.index=f;break}if(this.isWhitespace(h))f++;else break}d={index:d,text:c};if(Ka.hasOwnProperty(c))d.fn=Ka[c],d.json=Ka[c];else{var n=yc(c,this.options,this.text);d.fn=t(function(a,c){return n(a,c)},{assign:function(d,e){return ob(d,c,e,a.text,a.options)}})}this.tokens.push(d);
g&&(this.tokens.push({index:e,text:".",json:!1}),this.tokens.push({index:e+1,text:g,json:!1}))},readString:function(a){var c=this.index;this.index++;for(var d="",e=a,f=!1;this.index<this.text.length;){var g=this.text.charAt(this.index),e=e+g;if(f)"u"===g?(g=this.text.substring(this.index+1,this.index+5),g.match(/[\da-f]{4}/i)||this.throwError("Invalid unicode escape [\\u"+g+"]"),this.index+=4,d+=String.fromCharCode(parseInt(g,16))):d=(f=Yd[g])?d+f:d+g,f=!1;else if("\\"===g)f=!0;else{if(g===a){this.index++;
this.tokens.push({index:c,text:e,string:d,json:!0,fn:function(){return d}});return}d+=g}this.index++}this.throwError("Unterminated quote",c)}};var Za=function(a,c,d){this.lexer=a;this.$filter=c;this.options=d};Za.ZERO=function(){return 0};Za.prototype={constructor:Za,parse:function(a,c){this.text=a;this.json=c;this.tokens=this.lexer.lex(a);c&&(this.assignment=this.logicalOR,this.functionCall=this.fieldAccess=this.objectIndex=this.filterChain=function(){this.throwError("is not valid json",{text:a,
index:0})});var d=c?this.primary():this.statements();0!==this.tokens.length&&this.throwError("is an unexpected token",this.tokens[0]);d.literal=!!d.literal;d.constant=!!d.constant;return d},primary:function(){var a;if(this.expect("("))a=this.filterChain(),this.consume(")");else if(this.expect("["))a=this.arrayDeclaration();else if(this.expect("{"))a=this.object();else{var c=this.expect();(a=c.fn)||this.throwError("not a primary expression",c);c.json&&(a.constant=!0,a.literal=!0)}for(var d;c=this.expect("(",
"[",".");)"("===c.text?(a=this.functionCall(a,d),d=null):"["===c.text?(d=a,a=this.objectIndex(a)):"."===c.text?(d=a,a=this.fieldAccess(a)):this.throwError("IMPOSSIBLE");return a},throwError:function(a,c){throw ya("syntax",c.text,a,c.index+1,this.text,this.text.substring(c.index));},peekToken:function(){if(0===this.tokens.length)throw ya("ueoe",this.text);return this.tokens[0]},peek:function(a,c,d,e){if(0<this.tokens.length){var f=this.tokens[0],g=f.text;if(g===a||g===c||g===d||g===e||!(a||c||d||e))return f}return!1},
expect:function(a,c,d,e){return(a=this.peek(a,c,d,e))?(this.json&&!a.json&&this.throwError("is not valid json",a),this.tokens.shift(),a):!1},consume:function(a){this.expect(a)||this.throwError("is unexpected, expecting ["+a+"]",this.peek())},unaryFn:function(a,c){return t(function(d,e){return a(d,e,c)},{constant:c.constant})},ternaryFn:function(a,c,d){return t(function(e,f){return a(e,f)?c(e,f):d(e,f)},{constant:a.constant&&c.constant&&d.constant})},binaryFn:function(a,c,d){return t(function(e,f){return c(e,
f,a,d)},{constant:a.constant&&d.constant})},statements:function(){for(var a=[];;)if(0<this.tokens.length&&!this.peek("}",")",";","]")&&a.push(this.filterChain()),!this.expect(";"))return 1===a.length?a[0]:function(c,d){for(var e,f=0;f<a.length;f++){var g=a[f];g&&(e=g(c,d))}return e}},filterChain:function(){for(var a=this.expression(),c;;)if(c=this.expect("|"))a=this.binaryFn(a,c.fn,this.filter());else return a},filter:function(){for(var a=this.expect(),c=this.$filter(a.text),d=[];;)if(a=this.expect(":"))d.push(this.expression());
else{var e=function(a,e,h){h=[h];for(var n=0;n<d.length;n++)h.push(d[n](a,e));return c.apply(a,h)};return function(){return e}}},expression:function(){return this.assignment()},assignment:function(){var a=this.ternary(),c,d;return(d=this.expect("="))?(a.assign||this.throwError("implies assignment but ["+this.text.substring(0,d.index)+"] can not be assigned to",d),c=this.ternary(),function(d,f){return a.assign(d,c(d,f),f)}):a},ternary:function(){var a=this.logicalOR(),c,d;if(this.expect("?")){c=this.ternary();
if(d=this.expect(":"))return this.ternaryFn(a,c,this.ternary());this.throwError("expected :",d)}else return a},logicalOR:function(){for(var a=this.logicalAND(),c;;)if(c=this.expect("||"))a=this.binaryFn(a,c.fn,this.logicalAND());else return a},logicalAND:function(){var a=this.equality(),c;if(c=this.expect("&&"))a=this.binaryFn(a,c.fn,this.logicalAND());return a},equality:function(){var a=this.relational(),c;if(c=this.expect("==","!=","===","!=="))a=this.binaryFn(a,c.fn,this.equality());return a},
relational:function(){var a=this.additive(),c;if(c=this.expect("<",">","<=",">="))a=this.binaryFn(a,c.fn,this.relational());return a},additive:function(){for(var a=this.multiplicative(),c;c=this.expect("+","-");)a=this.binaryFn(a,c.fn,this.multiplicative());return a},multiplicative:function(){for(var a=this.unary(),c;c=this.expect("*","/","%");)a=this.binaryFn(a,c.fn,this.unary());return a},unary:function(){var a;return this.expect("+")?this.primary():(a=this.expect("-"))?this.binaryFn(Za.ZERO,a.fn,
this.unary()):(a=this.expect("!"))?this.unaryFn(a.fn,this.unary()):this.primary()},fieldAccess:function(a){var c=this,d=this.expect().text,e=yc(d,this.options,this.text);return t(function(c,d,h){return e(h||a(c,d))},{assign:function(e,g,h){return ob(a(e,h),d,g,c.text,c.options)}})},objectIndex:function(a){var c=this,d=this.expression();this.consume("]");return t(function(e,f){var g=a(e,f),h=d(e,f),n;if(!g)return s;(g=Ya(g[h],c.text))&&(g.then&&c.options.unwrapPromises)&&(n=g,"$$v"in g||(n.$$v=s,n.then(function(a){n.$$v=
a})),g=g.$$v);return g},{assign:function(e,f,g){var h=d(e,g);return Ya(a(e,g),c.text)[h]=f}})},functionCall:function(a,c){var d=[];if(")"!==this.peekToken().text){do d.push(this.expression());while(this.expect(","))}this.consume(")");var e=this;return function(f,g){for(var h=[],n=c?c(f,g):f,k=0;k<d.length;k++)h.push(d[k](f,g));k=a(f,g,n)||w;Ya(n,e.text);Ya(k,e.text);h=k.apply?k.apply(n,h):k(h[0],h[1],h[2],h[3],h[4]);return Ya(h,e.text)}},arrayDeclaration:function(){var a=[],c=!0;if("]"!==this.peekToken().text){do{var d=
this.expression();a.push(d);d.constant||(c=!1)}while(this.expect(","))}this.consume("]");return t(function(c,d){for(var g=[],h=0;h<a.length;h++)g.push(a[h](c,d));return g},{literal:!0,constant:c})},object:function(){var a=[],c=!0;if("}"!==this.peekToken().text){do{var d=this.expect(),d=d.string||d.text;this.consume(":");var e=this.expression();a.push({key:d,value:e});e.constant||(c=!1)}while(this.expect(","))}this.consume("}");return t(function(c,d){for(var e={},n=0;n<a.length;n++){var k=a[n];e[k.key]=
k.value(c,d)}return e},{literal:!0,constant:c})}};var Lb={},ra=E("$sce"),fa={HTML:"html",CSS:"css",URL:"url",RESOURCE_URL:"resourceUrl",JS:"js"},V=T.createElement("a"),Bc=xa(C.location.href,!0);Cc.$inject=["$provide"];Dc.$inject=["$locale"];Fc.$inject=["$locale"];var Ic=".",Sd={yyyy:$("FullYear",4),yy:$("FullYear",2,0,!0),y:$("FullYear",1),MMMM:pb("Month"),MMM:pb("Month",!0),MM:$("Month",2,1),M:$("Month",1,1),dd:$("Date",2),d:$("Date",1),HH:$("Hours",2),H:$("Hours",1),hh:$("Hours",2,-12),h:$("Hours",
1,-12),mm:$("Minutes",2),m:$("Minutes",1),ss:$("Seconds",2),s:$("Seconds",1),sss:$("Milliseconds",3),EEEE:pb("Day"),EEE:pb("Day",!0),a:function(a,c){return 12>a.getHours()?c.AMPMS[0]:c.AMPMS[1]},Z:function(a){a=-1*a.getTimezoneOffset();return a=(0<=a?"+":"")+(Nb(Math[0<a?"floor":"ceil"](a/60),2)+Nb(Math.abs(a%60),2))}},Rd=/((?:[^yMdHhmsaZE']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|d+|H+|h+|m+|s+|a|Z))(.*)/,Qd=/^\-?\d+$/;Ec.$inject=["$locale"];var Nd=aa(O),Od=aa(Ia);Gc.$inject=["$parse"];var Zd=aa({restrict:"E",
compile:function(a,c){8>=P&&(c.href||c.name||c.$set("href",""),a.append(T.createComment("IE fix")));if(!c.href&&!c.xlinkHref&&!c.name)return function(a,c){var f="[object SVGAnimatedString]"===Ma.call(c.prop("href"))?"xlink:href":"href";c.on("click",function(a){c.attr(f)||a.preventDefault()})}}}),Pb={};r(ib,function(a,c){if("multiple"!=a){var d=la("ng-"+c);Pb[d]=function(){return{priority:100,link:function(a,f,g){a.$watch(g[d],function(a){g.$set(c,!!a)})}}}}});r(["src","srcset","href"],function(a){var c=
la("ng-"+a);Pb[c]=function(){return{priority:99,link:function(d,e,f){f.$observe(c,function(c){c&&(f.$set(a,c),P&&e.prop(a,f[a]))})}}}});var sb={$addControl:w,$removeControl:w,$setValidity:w,$setDirty:w,$setPristine:w};Jc.$inject=["$element","$attrs","$scope"];var Lc=function(a){return["$timeout",function(c){return{name:"form",restrict:a?"EAC":"E",controller:Jc,compile:function(){return{pre:function(a,e,f,g){if(!f.action){var h=function(a){a.preventDefault?a.preventDefault():a.returnValue=!1};Kc(e[0],
"submit",h);e.on("$destroy",function(){c(function(){Eb(e[0],"submit",h)},0,!1)})}var n=e.parent().controller("form"),k=f.name||f.ngForm;k&&ob(a,k,g,k);if(n)e.on("$destroy",function(){n.$removeControl(g);k&&ob(a,k,s,k);t(g,sb)})}}}}}]},$d=Lc(),ae=Lc(!0),be=/^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,ce=/^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-z0-9-]+(\.[a-z0-9-]+)*$/i,de=/^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/,Mc={text:ub,number:function(a,c,d,e,f,g){ub(a,c,d,e,f,g);
e.$parsers.push(function(a){var c=e.$isEmpty(a);if(c||de.test(a))return e.$setValidity("number",!0),""===a?null:c?a:parseFloat(a);e.$setValidity("number",!1);return s});e.$formatters.push(function(a){return e.$isEmpty(a)?"":""+a});d.min&&(a=function(a){var c=parseFloat(d.min);return na(e,"min",e.$isEmpty(a)||a>=c,a)},e.$parsers.push(a),e.$formatters.push(a));d.max&&(a=function(a){var c=parseFloat(d.max);return na(e,"max",e.$isEmpty(a)||a<=c,a)},e.$parsers.push(a),e.$formatters.push(a));e.$formatters.push(function(a){return na(e,
"number",e.$isEmpty(a)||wb(a),a)})},url:function(a,c,d,e,f,g){ub(a,c,d,e,f,g);a=function(a){return na(e,"url",e.$isEmpty(a)||be.test(a),a)};e.$formatters.push(a);e.$parsers.push(a)},email:function(a,c,d,e,f,g){ub(a,c,d,e,f,g);a=function(a){return na(e,"email",e.$isEmpty(a)||ce.test(a),a)};e.$formatters.push(a);e.$parsers.push(a)},radio:function(a,c,d,e){x(d.name)&&c.attr("name",$a());c.on("click",function(){c[0].checked&&a.$apply(function(){e.$setViewValue(d.value)})});e.$render=function(){c[0].checked=
d.value==e.$viewValue};d.$observe("value",e.$render)},checkbox:function(a,c,d,e){var f=d.ngTrueValue,g=d.ngFalseValue;D(f)||(f=!0);D(g)||(g=!1);c.on("click",function(){a.$apply(function(){e.$setViewValue(c[0].checked)})});e.$render=function(){c[0].checked=e.$viewValue};e.$isEmpty=function(a){return a!==f};e.$formatters.push(function(a){return a===f});e.$parsers.push(function(a){return a?f:g})},hidden:w,button:w,submit:w,reset:w,file:w},Nc=["$browser","$sniffer",function(a,c){return{restrict:"E",require:"?ngModel",
link:function(d,e,f,g){g&&(Mc[O(f.type)]||Mc.text)(d,e,f,g,c,a)}}}],rb="ng-valid",qb="ng-invalid",Ja="ng-pristine",tb="ng-dirty",ee=["$scope","$exceptionHandler","$attrs","$element","$parse",function(a,c,d,e,f){function g(a,c){c=c?"-"+db(c,"-"):"";e.removeClass((a?qb:rb)+c).addClass((a?rb:qb)+c)}this.$modelValue=this.$viewValue=Number.NaN;this.$parsers=[];this.$formatters=[];this.$viewChangeListeners=[];this.$pristine=!0;this.$dirty=!1;this.$valid=!0;this.$invalid=!1;this.$name=d.name;var h=f(d.ngModel),
n=h.assign;if(!n)throw E("ngModel")("nonassign",d.ngModel,ga(e));this.$render=w;this.$isEmpty=function(a){return x(a)||""===a||null===a||a!==a};var k=e.inheritedData("$formController")||sb,l=0,m=this.$error={};e.addClass(Ja);g(!0);this.$setValidity=function(a,c){m[a]!==!c&&(c?(m[a]&&l--,l||(g(!0),this.$valid=!0,this.$invalid=!1)):(g(!1),this.$invalid=!0,this.$valid=!1,l++),m[a]=!c,g(c,a),k.$setValidity(a,c,this))};this.$setPristine=function(){this.$dirty=!1;this.$pristine=!0;e.removeClass(tb).addClass(Ja)};
this.$setViewValue=function(d){this.$viewValue=d;this.$pristine&&(this.$dirty=!0,this.$pristine=!1,e.removeClass(Ja).addClass(tb),k.$setDirty());r(this.$parsers,function(a){d=a(d)});this.$modelValue!==d&&(this.$modelValue=d,n(a,d),r(this.$viewChangeListeners,function(a){try{a()}catch(d){c(d)}}))};var p=this;a.$watch(function(){var c=h(a);if(p.$modelValue!==c){var d=p.$formatters,e=d.length;for(p.$modelValue=c;e--;)c=d[e](c);p.$viewValue!==c&&(p.$viewValue=c,p.$render())}return c})}],fe=function(){return{require:["ngModel",
"^?form"],controller:ee,link:function(a,c,d,e){var f=e[0],g=e[1]||sb;g.$addControl(f);a.$on("$destroy",function(){g.$removeControl(f)})}}},ge=aa({require:"ngModel",link:function(a,c,d,e){e.$viewChangeListeners.push(function(){a.$eval(d.ngChange)})}}),Oc=function(){return{require:"?ngModel",link:function(a,c,d,e){if(e){d.required=!0;var f=function(a){if(d.required&&e.$isEmpty(a))e.$setValidity("required",!1);else return e.$setValidity("required",!0),a};e.$formatters.push(f);e.$parsers.unshift(f);d.$observe("required",
function(){f(e.$viewValue)})}}}},he=function(){return{require:"ngModel",link:function(a,c,d,e){var f=(a=/\/(.*)\//.exec(d.ngList))&&RegExp(a[1])||d.ngList||",";e.$parsers.push(function(a){if(!x(a)){var c=[];a&&r(a.split(f),function(a){a&&c.push(da(a))});return c}});e.$formatters.push(function(a){return H(a)?a.join(", "):s});e.$isEmpty=function(a){return!a||!a.length}}}},ie=/^(true|false|\d+)$/,je=function(){return{priority:100,compile:function(a,c){return ie.test(c.ngValue)?function(a,c,f){f.$set("value",
a.$eval(f.ngValue))}:function(a,c,f){a.$watch(f.ngValue,function(a){f.$set("value",a)})}}}},ke=sa(function(a,c,d){c.addClass("ng-binding").data("$binding",d.ngBind);a.$watch(d.ngBind,function(a){c.text(a==s?"":a)})}),le=["$interpolate",function(a){return function(c,d,e){c=a(d.attr(e.$attr.ngBindTemplate));d.addClass("ng-binding").data("$binding",c);e.$observe("ngBindTemplate",function(a){d.text(a)})}}],me=["$sce","$parse",function(a,c){return function(d,e,f){e.addClass("ng-binding").data("$binding",
f.ngBindHtml);var g=c(f.ngBindHtml);d.$watch(function(){return(g(d)||"").toString()},function(c){e.html(a.getTrustedHtml(g(d))||"")})}}],ne=Ob("",!0),oe=Ob("Odd",0),pe=Ob("Even",1),qe=sa({compile:function(a,c){c.$set("ngCloak",s);a.removeClass("ng-cloak")}}),re=[function(){return{scope:!0,controller:"@",priority:500}}],Pc={};r("click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup keypress submit focus blur copy cut paste".split(" "),function(a){var c=la("ng-"+
a);Pc[c]=["$parse",function(d){return{compile:function(e,f){var g=d(f[c]);return function(c,d,e){d.on(O(a),function(a){c.$apply(function(){g(c,{$event:a})})})}}}}]});var se=["$animate",function(a){return{transclude:"element",priority:600,terminal:!0,restrict:"A",$$tlb:!0,link:function(c,d,e,f,g){var h,n;c.$watch(e.ngIf,function(f){Pa(f)?n||(n=c.$new(),g(n,function(c){c[c.length++]=T.createComment(" end ngIf: "+e.ngIf+" ");h={clone:c};a.enter(c,d.parent(),d)})):(n&&(n.$destroy(),n=null),h&&(a.leave(zb(h.clone)),
h=null))})}}}],te=["$http","$templateCache","$anchorScroll","$animate","$sce",function(a,c,d,e,f){return{restrict:"ECA",priority:400,terminal:!0,transclude:"element",controller:Ba.noop,compile:function(g,h){var n=h.ngInclude||h.src,k=h.onload||"",l=h.autoscroll;return function(g,h,q,r,B){var s=0,u,t,z=function(){u&&(u.$destroy(),u=null);t&&(e.leave(t),t=null)};g.$watch(f.parseAsResourceUrl(n),function(f){var n=function(){!v(l)||l&&!g.$eval(l)||d()},q=++s;f?(a.get(f,{cache:c}).success(function(a){if(q===
s){var c=g.$new();r.template=a;a=B(c,function(a){z();e.enter(a,null,h,n)});u=c;t=a;u.$emit("$includeContentLoaded");g.$eval(k)}}).error(function(){q===s&&z()}),g.$emit("$includeContentRequested")):(z(),r.template=null)})}}}}],ue=["$compile",function(a){return{restrict:"ECA",priority:-400,require:"ngInclude",link:function(c,d,e,f){d.html(f.template);a(d.contents())(c)}}}],ve=sa({priority:450,compile:function(){return{pre:function(a,c,d){a.$eval(d.ngInit)}}}}),we=sa({terminal:!0,priority:1E3}),xe=["$locale",
"$interpolate",function(a,c){var d=/{}/g;return{restrict:"EA",link:function(e,f,g){var h=g.count,n=g.$attr.when&&f.attr(g.$attr.when),k=g.offset||0,l=e.$eval(n)||{},m={},p=c.startSymbol(),q=c.endSymbol(),s=/^when(Minus)?(.+)$/;r(g,function(a,c){s.test(c)&&(l[O(c.replace("when","").replace("Minus","-"))]=f.attr(g.$attr[c]))});r(l,function(a,e){m[e]=c(a.replace(d,p+h+"-"+k+q))});e.$watch(function(){var c=parseFloat(e.$eval(h));if(isNaN(c))return"";c in l||(c=a.pluralCat(c-k));return m[c](e,f,!0)},function(a){f.text(a)})}}}],
ye=["$parse","$animate",function(a,c){var d=E("ngRepeat");return{transclude:"element",priority:1E3,terminal:!0,$$tlb:!0,link:function(e,f,g,h,n){var k=g.ngRepeat,l=k.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?\s*$/),m,p,q,s,t,v,u={$id:Ea};if(!l)throw d("iexp",k);g=l[1];h=l[2];(l=l[3])?(m=a(l),p=function(a,c,d){v&&(u[v]=a);u[t]=c;u.$index=d;return m(e,u)}):(q=function(a,c){return Ea(c)},s=function(a){return a});l=g.match(/^(?:([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\))$/);if(!l)throw d("iidexp",
g);t=l[3]||l[1];v=l[2];var G={};e.$watchCollection(h,function(a){var g,h,l=f[0],m,u={},D,M,w,x,E,J,H=[];if(vb(a))E=a,m=p||q;else{m=p||s;E=[];for(w in a)a.hasOwnProperty(w)&&"$"!=w.charAt(0)&&E.push(w);E.sort()}D=E.length;h=H.length=E.length;for(g=0;g<h;g++)if(w=a===E?g:E[g],x=a[w],x=m(w,x,g),wa(x,"`track by` id"),G.hasOwnProperty(x))J=G[x],delete G[x],u[x]=J,H[g]=J;else{if(u.hasOwnProperty(x))throw r(H,function(a){a&&a.scope&&(G[a.id]=a)}),d("dupes",k,x);H[g]={id:x};u[x]=!1}for(w in G)G.hasOwnProperty(w)&&
(J=G[w],g=zb(J.clone),c.leave(g),r(g,function(a){a.$$NG_REMOVED=!0}),J.scope.$destroy());g=0;for(h=E.length;g<h;g++){w=a===E?g:E[g];x=a[w];J=H[g];H[g-1]&&(l=H[g-1].clone[H[g-1].clone.length-1]);if(J.scope){M=J.scope;m=l;do m=m.nextSibling;while(m&&m.$$NG_REMOVED);J.clone[0]!=m&&c.move(zb(J.clone),null,z(l));l=J.clone[J.clone.length-1]}else M=e.$new();M[t]=x;v&&(M[v]=w);M.$index=g;M.$first=0===g;M.$last=g===D-1;M.$middle=!(M.$first||M.$last);M.$odd=!(M.$even=0===(g&1));J.scope||n(M,function(a){a[a.length++]=
T.createComment(" end ngRepeat: "+k+" ");c.enter(a,null,z(l));l=a;J.scope=M;J.clone=a;u[J.id]=J})}G=u})}}}],ze=["$animate",function(a){return function(c,d,e){c.$watch(e.ngShow,function(c){a[Pa(c)?"removeClass":"addClass"](d,"ng-hide")})}}],Ae=["$animate",function(a){return function(c,d,e){c.$watch(e.ngHide,function(c){a[Pa(c)?"addClass":"removeClass"](d,"ng-hide")})}}],Be=sa(function(a,c,d){a.$watch(d.ngStyle,function(a,d){d&&a!==d&&r(d,function(a,d){c.css(d,"")});a&&c.css(a)},!0)}),Ce=["$animate",
function(a){return{restrict:"EA",require:"ngSwitch",controller:["$scope",function(){this.cases={}}],link:function(c,d,e,f){var g,h,n=[];c.$watch(e.ngSwitch||e.on,function(d){for(var l=0,m=n.length;l<m;l++)n[l].$destroy(),a.leave(h[l]);h=[];n=[];if(g=f.cases["!"+d]||f.cases["?"])c.$eval(e.change),r(g,function(d){var e=c.$new();n.push(e);d.transclude(e,function(c){var e=d.element;h.push(c);a.enter(c,e.parent(),e)})})})}}}],De=sa({transclude:"element",priority:800,require:"^ngSwitch",link:function(a,
c,d,e,f){e.cases["!"+d.ngSwitchWhen]=e.cases["!"+d.ngSwitchWhen]||[];e.cases["!"+d.ngSwitchWhen].push({transclude:f,element:c})}}),Ee=sa({transclude:"element",priority:800,require:"^ngSwitch",link:function(a,c,d,e,f){e.cases["?"]=e.cases["?"]||[];e.cases["?"].push({transclude:f,element:c})}}),Fe=sa({link:function(a,c,d,e,f){if(!f)throw E("ngTransclude")("orphan",ga(c));f(function(a){c.empty();c.append(a)})}}),Ge=["$templateCache",function(a){return{restrict:"E",terminal:!0,compile:function(c,d){"text/ng-template"==
d.type&&a.put(d.id,c[0].text)}}}],He=E("ngOptions"),Ie=aa({terminal:!0}),Je=["$compile","$parse",function(a,c){var d=/^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+group\s+by\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?$/,e={$setViewValue:w};return{restrict:"E",require:["select","?ngModel"],controller:["$element","$scope","$attrs",function(a,c,d){var n=this,k={},l=e,m;n.databound=d.ngModel;n.init=function(a,
c,d){l=a;m=d};n.addOption=function(c){wa(c,'"option value"');k[c]=!0;l.$viewValue==c&&(a.val(c),m.parent()&&m.remove())};n.removeOption=function(a){this.hasOption(a)&&(delete k[a],l.$viewValue==a&&this.renderUnknownOption(a))};n.renderUnknownOption=function(c){c="? "+Ea(c)+" ?";m.val(c);a.prepend(m);a.val(c);m.prop("selected",!0)};n.hasOption=function(a){return k.hasOwnProperty(a)};c.$on("$destroy",function(){n.renderUnknownOption=w})}],link:function(e,g,h,n){function k(a,c,d,e){d.$render=function(){var a=
d.$viewValue;e.hasOption(a)?(D.parent()&&D.remove(),c.val(a),""===a&&w.prop("selected",!0)):x(a)&&w?c.val(""):e.renderUnknownOption(a)};c.on("change",function(){a.$apply(function(){D.parent()&&D.remove();d.$setViewValue(c.val())})})}function l(a,c,d){var e;d.$render=function(){var a=new Ta(d.$viewValue);r(c.find("option"),function(c){c.selected=v(a.get(c.value))})};a.$watch(function(){ta(e,d.$viewValue)||(e=ca(d.$viewValue),d.$render())});c.on("change",function(){a.$apply(function(){var a=[];r(c.find("option"),
function(c){c.selected&&a.push(c.value)});d.$setViewValue(a)})})}function m(e,f,g){function h(){var a={"":[]},c=[""],d,k,s,t,x;t=g.$modelValue;x=z(e)||[];var A=n?Qb(x):x,D,X,C;X={};s=!1;var K,I;if(q)if(w&&H(t))for(s=new Ta([]),C=0;C<t.length;C++)X[m]=t[C],s.put(w(e,X),t[C]);else s=new Ta(t);for(C=0;D=A.length,C<D;C++){k=C;if(n){k=A[C];if("$"===k.charAt(0))continue;X[n]=k}X[m]=x[k];d=p(e,X)||"";(k=a[d])||(k=a[d]=[],c.push(d));q?d=v(s.remove(w?w(e,X):r(e,X))):(w?(d={},d[m]=t,d=w(e,d)===w(e,X)):d=t===
r(e,X),s=s||d);K=l(e,X);K=v(K)?K:"";k.push({id:w?w(e,X):n?A[C]:C,label:K,selected:d})}q||(B||null===t?a[""].unshift({id:"",label:"",selected:!s}):s||a[""].unshift({id:"?",label:"",selected:!0}));X=0;for(A=c.length;X<A;X++){d=c[X];k=a[d];y.length<=X?(t={element:E.clone().attr("label",d),label:k.label},x=[t],y.push(x),f.append(t.element)):(x=y[X],t=x[0],t.label!=d&&t.element.attr("label",t.label=d));K=null;C=0;for(D=k.length;C<D;C++)s=k[C],(d=x[C+1])?(K=d.element,d.label!==s.label&&K.text(d.label=s.label),
d.id!==s.id&&K.val(d.id=s.id),K[0].selected!==s.selected&&K.prop("selected",d.selected=s.selected)):(""===s.id&&B?I=B:(I=u.clone()).val(s.id).attr("selected",s.selected).text(s.label),x.push({element:I,label:s.label,id:s.id,selected:s.selected}),K?K.after(I):t.element.append(I),K=I);for(C++;x.length>C;)x.pop().element.remove()}for(;y.length>X;)y.pop()[0].element.remove()}var k;if(!(k=t.match(d)))throw He("iexp",t,ga(f));var l=c(k[2]||k[1]),m=k[4]||k[6],n=k[5],p=c(k[3]||""),r=c(k[2]?k[1]:m),z=c(k[7]),
w=k[8]?c(k[8]):null,y=[[{element:f,label:""}]];B&&(a(B)(e),B.removeClass("ng-scope"),B.remove());f.empty();f.on("change",function(){e.$apply(function(){var a,c=z(e)||[],d={},h,k,l,p,t,v,u;if(q)for(k=[],p=0,v=y.length;p<v;p++)for(a=y[p],l=1,t=a.length;l<t;l++){if((h=a[l].element)[0].selected){h=h.val();n&&(d[n]=h);if(w)for(u=0;u<c.length&&(d[m]=c[u],w(e,d)!=h);u++);else d[m]=c[h];k.push(r(e,d))}}else if(h=f.val(),"?"==h)k=s;else if(""===h)k=null;else if(w)for(u=0;u<c.length;u++){if(d[m]=c[u],w(e,d)==
h){k=r(e,d);break}}else d[m]=c[h],n&&(d[n]=h),k=r(e,d);g.$setViewValue(k)})});g.$render=h;e.$watch(h)}if(n[1]){var p=n[0];n=n[1];var q=h.multiple,t=h.ngOptions,B=!1,w,u=z(T.createElement("option")),E=z(T.createElement("optgroup")),D=u.clone();h=0;for(var y=g.children(),C=y.length;h<C;h++)if(""===y[h].value){w=B=y.eq(h);break}p.init(n,B,D);q&&(n.$isEmpty=function(a){return!a||0===a.length});t?m(e,g,n):q?l(e,g,n):k(e,g,n,p)}}}}],Ke=["$interpolate",function(a){var c={addOption:w,removeOption:w};return{restrict:"E",
priority:100,compile:function(d,e){if(x(e.value)){var f=a(d.text(),!0);f||e.$set("value",d.text())}return function(a,d,e){var k=d.parent(),l=k.data("$selectController")||k.parent().data("$selectController");l&&l.databound?d.prop("selected",!1):l=c;f?a.$watch(f,function(a,c){e.$set("value",a);a!==c&&l.removeOption(c);l.addOption(a)}):l.addOption(e.value);d.on("$destroy",function(){l.removeOption(e.value)})}}}}],Le=aa({restrict:"E",terminal:!0});(Ca=C.jQuery)?(z=Ca,t(Ca.fn,{scope:Fa.scope,isolateScope:Fa.isolateScope,
controller:Fa.controller,injector:Fa.injector,inheritedData:Fa.inheritedData}),Ab("remove",!0,!0,!1),Ab("empty",!1,!1,!1),Ab("html",!1,!1,!0)):z=R;Ba.element=z;(function(a){t(a,{bootstrap:$b,copy:ca,extend:t,equals:ta,element:z,forEach:r,injector:ac,noop:w,bind:cb,toJson:oa,fromJson:Wb,identity:Aa,isUndefined:x,isDefined:v,isString:D,isFunction:N,isObject:Z,isNumber:wb,isElement:Rc,isArray:H,version:Ud,isDate:La,lowercase:O,uppercase:Ia,callbacks:{counter:0},$$minErr:E,$$csp:Vb});Va=Wc(C);try{Va("ngLocale")}catch(c){Va("ngLocale",
[]).provider("$locale",td)}Va("ng",["ngLocale"],["$provide",function(a){a.provider({$$sanitizeUri:Dd});a.provider("$compile",kc).directive({a:Zd,input:Nc,textarea:Nc,form:$d,script:Ge,select:Je,style:Le,option:Ke,ngBind:ke,ngBindHtml:me,ngBindTemplate:le,ngClass:ne,ngClassEven:pe,ngClassOdd:oe,ngCloak:qe,ngController:re,ngForm:ae,ngHide:Ae,ngIf:se,ngInclude:te,ngInit:ve,ngNonBindable:we,ngPluralize:xe,ngRepeat:ye,ngShow:ze,ngStyle:Be,ngSwitch:Ce,ngSwitchWhen:De,ngSwitchDefault:Ee,ngOptions:Ie,ngTransclude:Fe,
ngModel:fe,ngList:he,ngChange:ge,required:Oc,ngRequired:Oc,ngValue:je}).directive({ngInclude:ue}).directive(Pb).directive(Pc);a.provider({$anchorScroll:ed,$animate:Wd,$browser:gd,$cacheFactory:hd,$controller:kd,$document:ld,$exceptionHandler:md,$filter:Cc,$interpolate:rd,$interval:sd,$http:nd,$httpBackend:pd,$location:vd,$log:wd,$parse:zd,$rootScope:Cd,$q:Ad,$sce:Gd,$sceDelegate:Fd,$sniffer:Hd,$templateCache:id,$timeout:Id,$window:Jd})}])})(Ba);z(T).ready(function(){Uc(T,$b)})})(window,document);
!angular.$$csp()&&angular.element(document).find("head").prepend('<style type="text/css">@charset "UTF-8";[ng\\:cloak],[ng-cloak],[data-ng-cloak],[x-ng-cloak],.ng-cloak,.x-ng-cloak,.ng-hide{display:none !important;}ng\\:form{display:block;}.ng-animate-block-transitions{transition:0s all!important;-webkit-transition:0s all!important;}</style>');
//# sourceMappingURL=angular.min.js.map

},{}],18:[function(require,module,exports){
(function(angular, undefined){
    'use strict';

    function fakeNgModel(initValue){
        return {
            $setViewValue: function(value){
                this.$viewValue = value;
            },
            $viewValue: initValue
        };
    }

    angular.module('luegg.directives', [])
    .directive('scrollGlue', function(){
        return {
            priority: 1,
            require: ['?ngModel'],
            restrict: 'A',
            link: function(scope, $el, attrs, ctrls){
                var el = $el[0],
                    ngModel = ctrls[0] || fakeNgModel(true);

                function scrollToBottom(){
                    el.scrollTop = el.scrollHeight;
                }

                function shouldActivateAutoScroll(){
                    // + 1 catches off by one errors in chrome
                    return el.scrollTop + el.clientHeight + 1 >= el.scrollHeight;
                }

                scope.$watch(function(){
                    if(ngModel.$viewValue){
                        scrollToBottom();
                    }
                });

                $el.bind('scroll', function(){
                    scope.$apply(ngModel.$setViewValue.bind(ngModel, shouldActivateAutoScroll()));
                });
            }
        };
    });
}(angular));

},{}],19:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseDifference = require('lodash._basedifference'),
    baseFlatten = require('lodash._baseflatten'),
    createCallback = require('lodash.createcallback'),
    forIn = require('lodash.forin');

/**
 * Creates a shallow clone of `object` excluding the specified properties.
 * Property names may be specified as individual arguments or as arrays of
 * property names. If a callback is provided it will be executed for each
 * property of `object` omitting the properties the callback returns truey
 * for. The callback is bound to `thisArg` and invoked with three arguments;
 * (value, key, object).
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {Object} object The source object.
 * @param {Function|...string|string[]} [callback] The properties to omit or the
 *  function called per iteration.
 * @param {*} [thisArg] The `this` binding of `callback`.
 * @returns {Object} Returns an object without the omitted properties.
 * @example
 *
 * _.omit({ 'name': 'fred', 'age': 40 }, 'age');
 * // => { 'name': 'fred' }
 *
 * _.omit({ 'name': 'fred', 'age': 40 }, function(value) {
 *   return typeof value == 'number';
 * });
 * // => { 'name': 'fred' }
 */
function omit(object, callback, thisArg) {
  var result = {};
  if (typeof callback != 'function') {
    var props = [];
    forIn(object, function(value, key) {
      props.push(key);
    });
    props = baseDifference(props, baseFlatten(arguments, true, false, 1));

    var index = -1,
        length = props.length;

    while (++index < length) {
      var key = props[index];
      result[key] = object[key];
    }
  } else {
    callback = createCallback(callback, thisArg, 3);
    forIn(object, function(value, key, object) {
      if (!callback(value, key, object)) {
        result[key] = value;
      }
    });
  }
  return result;
}

module.exports = omit;

},{"lodash._basedifference":20,"lodash._baseflatten":33,"lodash.createcallback":37,"lodash.forin":72}],20:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseIndexOf = require('lodash._baseindexof'),
    cacheIndexOf = require('lodash._cacheindexof'),
    createCache = require('lodash._createcache'),
    largeArraySize = require('lodash._largearraysize'),
    releaseObject = require('lodash._releaseobject');

/**
 * The base implementation of `_.difference` that accepts a single array
 * of values to exclude.
 *
 * @private
 * @param {Array} array The array to process.
 * @param {Array} [values] The array of values to exclude.
 * @returns {Array} Returns a new array of filtered values.
 */
function baseDifference(array, values) {
  var index = -1,
      indexOf = baseIndexOf,
      length = array ? array.length : 0,
      isLarge = length >= largeArraySize,
      result = [];

  if (isLarge) {
    var cache = createCache(values);
    if (cache) {
      indexOf = cacheIndexOf;
      values = cache;
    } else {
      isLarge = false;
    }
  }
  while (++index < length) {
    var value = array[index];
    if (indexOf(values, value) < 0) {
      result.push(value);
    }
  }
  if (isLarge) {
    releaseObject(values);
  }
  return result;
}

module.exports = baseDifference;

},{"lodash._baseindexof":21,"lodash._cacheindexof":22,"lodash._createcache":24,"lodash._largearraysize":29,"lodash._releaseobject":30}],21:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * The base implementation of `_.indexOf` without support for binary searches
 * or `fromIndex` constraints.
 *
 * @private
 * @param {Array} array The array to search.
 * @param {*} value The value to search for.
 * @param {number} [fromIndex=0] The index to search from.
 * @returns {number} Returns the index of the matched value or `-1`.
 */
function baseIndexOf(array, value, fromIndex) {
  var index = (fromIndex || 0) - 1,
      length = array ? array.length : 0;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

module.exports = baseIndexOf;

},{}],22:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseIndexOf = require('lodash._baseindexof'),
    keyPrefix = require('lodash._keyprefix');

/**
 * An implementation of `_.contains` for cache objects that mimics the return
 * signature of `_.indexOf` by returning `0` if the value is found, else `-1`.
 *
 * @private
 * @param {Object} cache The cache object to inspect.
 * @param {*} value The value to search for.
 * @returns {number} Returns `0` if `value` is found, else `-1`.
 */
function cacheIndexOf(cache, value) {
  var type = typeof value;
  cache = cache.cache;

  if (type == 'boolean' || value == null) {
    return cache[value] ? 0 : -1;
  }
  if (type != 'number' && type != 'string') {
    type = 'object';
  }
  var key = type == 'number' ? value : keyPrefix + value;
  cache = (cache = cache[type]) && cache[key];

  return type == 'object'
    ? (cache && baseIndexOf(cache, value) > -1 ? 0 : -1)
    : (cache ? 0 : -1);
}

module.exports = cacheIndexOf;

},{"lodash._baseindexof":21,"lodash._keyprefix":23}],23:[function(require,module,exports){
/**
 * Lo-Dash 2.4.2 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2014 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used to prefix keys to avoid issues with `__proto__` and properties on `Object.prototype` */
var keyPrefix = '__1335248838000__';

module.exports = keyPrefix;

},{}],24:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var cachePush = require('lodash._cachepush'),
    getObject = require('lodash._getobject'),
    releaseObject = require('lodash._releaseobject');

/**
 * Creates a cache object to optimize linear searches of large arrays.
 *
 * @private
 * @param {Array} [array=[]] The array to search.
 * @returns {null|Object} Returns the cache object or `null` if caching should not be used.
 */
function createCache(array) {
  var index = -1,
      length = array.length,
      first = array[0],
      mid = array[(length / 2) | 0],
      last = array[length - 1];

  if (first && typeof first == 'object' &&
      mid && typeof mid == 'object' && last && typeof last == 'object') {
    return false;
  }
  var cache = getObject();
  cache['false'] = cache['null'] = cache['true'] = cache['undefined'] = false;

  var result = getObject();
  result.array = array;
  result.cache = cache;
  result.push = cachePush;

  while (++index < length) {
    result.push(array[index]);
  }
  return result;
}

module.exports = createCache;

},{"lodash._cachepush":25,"lodash._getobject":27,"lodash._releaseobject":30}],25:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var keyPrefix = require('lodash._keyprefix');

/**
 * Adds a given value to the corresponding cache object.
 *
 * @private
 * @param {*} value The value to add to the cache.
 */
function cachePush(value) {
  var cache = this.cache,
      type = typeof value;

  if (type == 'boolean' || value == null) {
    cache[value] = true;
  } else {
    if (type != 'number' && type != 'string') {
      type = 'object';
    }
    var key = type == 'number' ? value : keyPrefix + value,
        typeCache = cache[type] || (cache[type] = {});

    if (type == 'object') {
      (typeCache[key] || (typeCache[key] = [])).push(value);
    } else {
      typeCache[key] = true;
    }
  }
}

module.exports = cachePush;

},{"lodash._keyprefix":26}],26:[function(require,module,exports){
module.exports=require(23)
},{}],27:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var objectPool = require('lodash._objectpool');

/**
 * Gets an object from the object pool or creates a new one if the pool is empty.
 *
 * @private
 * @returns {Object} The object from the pool.
 */
function getObject() {
  return objectPool.pop() || {
    'array': null,
    'cache': null,
    'criteria': null,
    'false': false,
    'index': 0,
    'null': false,
    'number': null,
    'object': null,
    'push': null,
    'string': null,
    'true': false,
    'undefined': false,
    'value': null
  };
}

module.exports = getObject;

},{"lodash._objectpool":28}],28:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used to pool arrays and objects used internally */
var objectPool = [];

module.exports = objectPool;

},{}],29:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used as the size when optimizations are enabled for large arrays */
var largeArraySize = 75;

module.exports = largeArraySize;

},{}],30:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var maxPoolSize = require('lodash._maxpoolsize'),
    objectPool = require('lodash._objectpool');

/**
 * Releases the given object back to the object pool.
 *
 * @private
 * @param {Object} [object] The object to release.
 */
function releaseObject(object) {
  var cache = object.cache;
  if (cache) {
    releaseObject(cache);
  }
  object.array = object.cache = object.criteria = object.object = object.number = object.string = object.value = null;
  if (objectPool.length < maxPoolSize) {
    objectPool.push(object);
  }
}

module.exports = releaseObject;

},{"lodash._maxpoolsize":31,"lodash._objectpool":32}],31:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used as the max size of the `arrayPool` and `objectPool` */
var maxPoolSize = 40;

module.exports = maxPoolSize;

},{}],32:[function(require,module,exports){
module.exports=require(28)
},{}],33:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isArguments = require('lodash.isarguments'),
    isArray = require('lodash.isarray');

/**
 * The base implementation of `_.flatten` without support for callback
 * shorthands or `thisArg` binding.
 *
 * @private
 * @param {Array} array The array to flatten.
 * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
 * @param {boolean} [isStrict=false] A flag to restrict flattening to arrays and `arguments` objects.
 * @param {number} [fromIndex=0] The index to start from.
 * @returns {Array} Returns a new flattened array.
 */
function baseFlatten(array, isShallow, isStrict, fromIndex) {
  var index = (fromIndex || 0) - 1,
      length = array ? array.length : 0,
      result = [];

  while (++index < length) {
    var value = array[index];

    if (value && typeof value == 'object' && typeof value.length == 'number'
        && (isArray(value) || isArguments(value))) {
      // recursively flatten arrays (susceptible to call stack limits)
      if (!isShallow) {
        value = baseFlatten(value, isShallow, isStrict);
      }
      var valIndex = -1,
          valLength = value.length,
          resIndex = result.length;

      result.length += valLength;
      while (++valIndex < valLength) {
        result[resIndex++] = value[valIndex];
      }
    } else if (!isStrict) {
      result.push(value);
    }
  }
  return result;
}

module.exports = baseFlatten;

},{"lodash.isarguments":34,"lodash.isarray":35}],34:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** `Object#toString` result shortcuts */
var argsClass = '[object Arguments]';

/** Used for native method references */
var objectProto = Object.prototype;

/** Used to resolve the internal [[Class]] of values */
var toString = objectProto.toString;

/**
 * Checks if `value` is an `arguments` object.
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is an `arguments` object, else `false`.
 * @example
 *
 * (function() { return _.isArguments(arguments); })(1, 2, 3);
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  return value && typeof value == 'object' && typeof value.length == 'number' &&
    toString.call(value) == argsClass || false;
}

module.exports = isArguments;

},{}],35:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isNative = require('lodash._isnative');

/** `Object#toString` result shortcuts */
var arrayClass = '[object Array]';

/** Used for native method references */
var objectProto = Object.prototype;

/** Used to resolve the internal [[Class]] of values */
var toString = objectProto.toString;

/* Native method shortcuts for methods with the same name as other `lodash` methods */
var nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray;

/**
 * Checks if `value` is an array.
 *
 * @static
 * @memberOf _
 * @type Function
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is an array, else `false`.
 * @example
 *
 * (function() { return _.isArray(arguments); })();
 * // => false
 *
 * _.isArray([1, 2, 3]);
 * // => true
 */
var isArray = nativeIsArray || function(value) {
  return value && typeof value == 'object' && typeof value.length == 'number' &&
    toString.call(value) == arrayClass || false;
};

module.exports = isArray;

},{"lodash._isnative":36}],36:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used for native method references */
var objectProto = Object.prototype;

/** Used to resolve the internal [[Class]] of values */
var toString = objectProto.toString;

/** Used to detect if a method is native */
var reNative = RegExp('^' +
  String(toString)
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/toString| for [^\]]+/g, '.*?') + '$'
);

/**
 * Checks if `value` is a native function.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
 */
function isNative(value) {
  return typeof value == 'function' && reNative.test(value);
}

module.exports = isNative;

},{}],37:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseCreateCallback = require('lodash._basecreatecallback'),
    baseIsEqual = require('lodash._baseisequal'),
    isObject = require('lodash.isobject'),
    keys = require('lodash.keys'),
    property = require('lodash.property');

/**
 * Produces a callback bound to an optional `thisArg`. If `func` is a property
 * name the created callback will return the property value for a given element.
 * If `func` is an object the created callback will return `true` for elements
 * that contain the equivalent object properties, otherwise it will return `false`.
 *
 * @static
 * @memberOf _
 * @category Utilities
 * @param {*} [func=identity] The value to convert to a callback.
 * @param {*} [thisArg] The `this` binding of the created callback.
 * @param {number} [argCount] The number of arguments the callback accepts.
 * @returns {Function} Returns a callback function.
 * @example
 *
 * var characters = [
 *   { 'name': 'barney', 'age': 36 },
 *   { 'name': 'fred',   'age': 40 }
 * ];
 *
 * // wrap to create custom callback shorthands
 * _.createCallback = _.wrap(_.createCallback, function(func, callback, thisArg) {
 *   var match = /^(.+?)__([gl]t)(.+)$/.exec(callback);
 *   return !match ? func(callback, thisArg) : function(object) {
 *     return match[2] == 'gt' ? object[match[1]] > match[3] : object[match[1]] < match[3];
 *   };
 * });
 *
 * _.filter(characters, 'age__gt38');
 * // => [{ 'name': 'fred', 'age': 40 }]
 */
function createCallback(func, thisArg, argCount) {
  var type = typeof func;
  if (func == null || type == 'function') {
    return baseCreateCallback(func, thisArg, argCount);
  }
  // handle "_.pluck" style callback shorthands
  if (type != 'object') {
    return property(func);
  }
  var props = keys(func),
      key = props[0],
      a = func[key];

  // handle "_.where" style callback shorthands
  if (props.length == 1 && a === a && !isObject(a)) {
    // fast path the common case of providing an object with a single
    // property containing a primitive value
    return function(object) {
      var b = object[key];
      return a === b && (a !== 0 || (1 / a == 1 / b));
    };
  }
  return function(object) {
    var length = props.length,
        result = false;

    while (length--) {
      if (!(result = baseIsEqual(object[props[length]], func[props[length]], null, true))) {
        break;
      }
    }
    return result;
  };
}

module.exports = createCallback;

},{"lodash._basecreatecallback":38,"lodash._baseisequal":57,"lodash.isobject":65,"lodash.keys":67,"lodash.property":71}],38:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var bind = require('lodash.bind'),
    identity = require('lodash.identity'),
    setBindData = require('lodash._setbinddata'),
    support = require('lodash.support');

/** Used to detected named functions */
var reFuncName = /^\s*function[ \n\r\t]+\w/;

/** Used to detect functions containing a `this` reference */
var reThis = /\bthis\b/;

/** Native method shortcuts */
var fnToString = Function.prototype.toString;

/**
 * The base implementation of `_.createCallback` without support for creating
 * "_.pluck" or "_.where" style callbacks.
 *
 * @private
 * @param {*} [func=identity] The value to convert to a callback.
 * @param {*} [thisArg] The `this` binding of the created callback.
 * @param {number} [argCount] The number of arguments the callback accepts.
 * @returns {Function} Returns a callback function.
 */
function baseCreateCallback(func, thisArg, argCount) {
  if (typeof func != 'function') {
    return identity;
  }
  // exit early for no `thisArg` or already bound by `Function#bind`
  if (typeof thisArg == 'undefined' || !('prototype' in func)) {
    return func;
  }
  var bindData = func.__bindData__;
  if (typeof bindData == 'undefined') {
    if (support.funcNames) {
      bindData = !func.name;
    }
    bindData = bindData || !support.funcDecomp;
    if (!bindData) {
      var source = fnToString.call(func);
      if (!support.funcNames) {
        bindData = !reFuncName.test(source);
      }
      if (!bindData) {
        // checks if `func` references the `this` keyword and stores the result
        bindData = reThis.test(source);
        setBindData(func, bindData);
      }
    }
  }
  // exit early if there are no `this` references or `func` is bound
  if (bindData === false || (bindData !== true && bindData[1] & 1)) {
    return func;
  }
  switch (argCount) {
    case 1: return function(value) {
      return func.call(thisArg, value);
    };
    case 2: return function(a, b) {
      return func.call(thisArg, a, b);
    };
    case 3: return function(value, index, collection) {
      return func.call(thisArg, value, index, collection);
    };
    case 4: return function(accumulator, value, index, collection) {
      return func.call(thisArg, accumulator, value, index, collection);
    };
  }
  return bind(func, thisArg);
}

module.exports = baseCreateCallback;

},{"lodash._setbinddata":39,"lodash.bind":42,"lodash.identity":54,"lodash.support":55}],39:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isNative = require('lodash._isnative'),
    noop = require('lodash.noop');

/** Used as the property descriptor for `__bindData__` */
var descriptor = {
  'configurable': false,
  'enumerable': false,
  'value': null,
  'writable': false
};

/** Used to set meta data on functions */
var defineProperty = (function() {
  // IE 8 only accepts DOM elements
  try {
    var o = {},
        func = isNative(func = Object.defineProperty) && func,
        result = func(o, o, o) && func;
  } catch(e) { }
  return result;
}());

/**
 * Sets `this` binding data on a given function.
 *
 * @private
 * @param {Function} func The function to set data on.
 * @param {Array} value The data array to set.
 */
var setBindData = !defineProperty ? noop : function(func, value) {
  descriptor.value = value;
  defineProperty(func, '__bindData__', descriptor);
};

module.exports = setBindData;

},{"lodash._isnative":40,"lodash.noop":41}],40:[function(require,module,exports){
module.exports=require(36)
},{}],41:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * A no-operation function.
 *
 * @static
 * @memberOf _
 * @category Utilities
 * @example
 *
 * var object = { 'name': 'fred' };
 * _.noop(object) === undefined;
 * // => true
 */
function noop() {
  // no operation performed
}

module.exports = noop;

},{}],42:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var createWrapper = require('lodash._createwrapper'),
    slice = require('lodash._slice');

/**
 * Creates a function that, when called, invokes `func` with the `this`
 * binding of `thisArg` and prepends any additional `bind` arguments to those
 * provided to the bound function.
 *
 * @static
 * @memberOf _
 * @category Functions
 * @param {Function} func The function to bind.
 * @param {*} [thisArg] The `this` binding of `func`.
 * @param {...*} [arg] Arguments to be partially applied.
 * @returns {Function} Returns the new bound function.
 * @example
 *
 * var func = function(greeting) {
 *   return greeting + ' ' + this.name;
 * };
 *
 * func = _.bind(func, { 'name': 'fred' }, 'hi');
 * func();
 * // => 'hi fred'
 */
function bind(func, thisArg) {
  return arguments.length > 2
    ? createWrapper(func, 17, slice(arguments, 2), null, thisArg)
    : createWrapper(func, 1, null, null, thisArg);
}

module.exports = bind;

},{"lodash._createwrapper":43,"lodash._slice":53}],43:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseBind = require('lodash._basebind'),
    baseCreateWrapper = require('lodash._basecreatewrapper'),
    isFunction = require('lodash.isfunction'),
    slice = require('lodash._slice');

/**
 * Used for `Array` method references.
 *
 * Normally `Array.prototype` would suffice, however, using an array literal
 * avoids issues in Narwhal.
 */
var arrayRef = [];

/** Native method shortcuts */
var push = arrayRef.push,
    unshift = arrayRef.unshift;

/**
 * Creates a function that, when called, either curries or invokes `func`
 * with an optional `this` binding and partially applied arguments.
 *
 * @private
 * @param {Function|string} func The function or method name to reference.
 * @param {number} bitmask The bitmask of method flags to compose.
 *  The bitmask may be composed of the following flags:
 *  1 - `_.bind`
 *  2 - `_.bindKey`
 *  4 - `_.curry`
 *  8 - `_.curry` (bound)
 *  16 - `_.partial`
 *  32 - `_.partialRight`
 * @param {Array} [partialArgs] An array of arguments to prepend to those
 *  provided to the new function.
 * @param {Array} [partialRightArgs] An array of arguments to append to those
 *  provided to the new function.
 * @param {*} [thisArg] The `this` binding of `func`.
 * @param {number} [arity] The arity of `func`.
 * @returns {Function} Returns the new function.
 */
function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
  var isBind = bitmask & 1,
      isBindKey = bitmask & 2,
      isCurry = bitmask & 4,
      isCurryBound = bitmask & 8,
      isPartial = bitmask & 16,
      isPartialRight = bitmask & 32;

  if (!isBindKey && !isFunction(func)) {
    throw new TypeError;
  }
  if (isPartial && !partialArgs.length) {
    bitmask &= ~16;
    isPartial = partialArgs = false;
  }
  if (isPartialRight && !partialRightArgs.length) {
    bitmask &= ~32;
    isPartialRight = partialRightArgs = false;
  }
  var bindData = func && func.__bindData__;
  if (bindData && bindData !== true) {
    // clone `bindData`
    bindData = slice(bindData);
    if (bindData[2]) {
      bindData[2] = slice(bindData[2]);
    }
    if (bindData[3]) {
      bindData[3] = slice(bindData[3]);
    }
    // set `thisBinding` is not previously bound
    if (isBind && !(bindData[1] & 1)) {
      bindData[4] = thisArg;
    }
    // set if previously bound but not currently (subsequent curried functions)
    if (!isBind && bindData[1] & 1) {
      bitmask |= 8;
    }
    // set curried arity if not yet set
    if (isCurry && !(bindData[1] & 4)) {
      bindData[5] = arity;
    }
    // append partial left arguments
    if (isPartial) {
      push.apply(bindData[2] || (bindData[2] = []), partialArgs);
    }
    // append partial right arguments
    if (isPartialRight) {
      unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
    }
    // merge flags
    bindData[1] |= bitmask;
    return createWrapper.apply(null, bindData);
  }
  // fast path for `_.bind`
  var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;
  return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);
}

module.exports = createWrapper;

},{"lodash._basebind":44,"lodash._basecreatewrapper":48,"lodash._slice":53,"lodash.isfunction":52}],44:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseCreate = require('lodash._basecreate'),
    isObject = require('lodash.isobject'),
    setBindData = require('lodash._setbinddata'),
    slice = require('lodash._slice');

/**
 * Used for `Array` method references.
 *
 * Normally `Array.prototype` would suffice, however, using an array literal
 * avoids issues in Narwhal.
 */
var arrayRef = [];

/** Native method shortcuts */
var push = arrayRef.push;

/**
 * The base implementation of `_.bind` that creates the bound function and
 * sets its meta data.
 *
 * @private
 * @param {Array} bindData The bind data array.
 * @returns {Function} Returns the new bound function.
 */
function baseBind(bindData) {
  var func = bindData[0],
      partialArgs = bindData[2],
      thisArg = bindData[4];

  function bound() {
    // `Function#bind` spec
    // http://es5.github.io/#x15.3.4.5
    if (partialArgs) {
      // avoid `arguments` object deoptimizations by using `slice` instead
      // of `Array.prototype.slice.call` and not assigning `arguments` to a
      // variable as a ternary expression
      var args = slice(partialArgs);
      push.apply(args, arguments);
    }
    // mimic the constructor's `return` behavior
    // http://es5.github.io/#x13.2.2
    if (this instanceof bound) {
      // ensure `new bound` is an instance of `func`
      var thisBinding = baseCreate(func.prototype),
          result = func.apply(thisBinding, args || arguments);
      return isObject(result) ? result : thisBinding;
    }
    return func.apply(thisArg, args || arguments);
  }
  setBindData(bound, bindData);
  return bound;
}

module.exports = baseBind;

},{"lodash._basecreate":45,"lodash._setbinddata":39,"lodash._slice":53,"lodash.isobject":65}],45:[function(require,module,exports){
(function (global){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isNative = require('lodash._isnative'),
    isObject = require('lodash.isobject'),
    noop = require('lodash.noop');

/* Native method shortcuts for methods with the same name as other `lodash` methods */
var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate;

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} prototype The object to inherit from.
 * @returns {Object} Returns the new object.
 */
function baseCreate(prototype, properties) {
  return isObject(prototype) ? nativeCreate(prototype) : {};
}
// fallback for browsers without `Object.create`
if (!nativeCreate) {
  baseCreate = (function() {
    function Object() {}
    return function(prototype) {
      if (isObject(prototype)) {
        Object.prototype = prototype;
        var result = new Object;
        Object.prototype = null;
      }
      return result || global.Object();
    };
  }());
}

module.exports = baseCreate;

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"lodash._isnative":46,"lodash.isobject":65,"lodash.noop":47}],46:[function(require,module,exports){
module.exports=require(36)
},{}],47:[function(require,module,exports){
module.exports=require(41)
},{}],48:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseCreate = require('lodash._basecreate'),
    isObject = require('lodash.isobject'),
    setBindData = require('lodash._setbinddata'),
    slice = require('lodash._slice');

/**
 * Used for `Array` method references.
 *
 * Normally `Array.prototype` would suffice, however, using an array literal
 * avoids issues in Narwhal.
 */
var arrayRef = [];

/** Native method shortcuts */
var push = arrayRef.push;

/**
 * The base implementation of `createWrapper` that creates the wrapper and
 * sets its meta data.
 *
 * @private
 * @param {Array} bindData The bind data array.
 * @returns {Function} Returns the new function.
 */
function baseCreateWrapper(bindData) {
  var func = bindData[0],
      bitmask = bindData[1],
      partialArgs = bindData[2],
      partialRightArgs = bindData[3],
      thisArg = bindData[4],
      arity = bindData[5];

  var isBind = bitmask & 1,
      isBindKey = bitmask & 2,
      isCurry = bitmask & 4,
      isCurryBound = bitmask & 8,
      key = func;

  function bound() {
    var thisBinding = isBind ? thisArg : this;
    if (partialArgs) {
      var args = slice(partialArgs);
      push.apply(args, arguments);
    }
    if (partialRightArgs || isCurry) {
      args || (args = slice(arguments));
      if (partialRightArgs) {
        push.apply(args, partialRightArgs);
      }
      if (isCurry && args.length < arity) {
        bitmask |= 16 & ~32;
        return baseCreateWrapper([func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity]);
      }
    }
    args || (args = arguments);
    if (isBindKey) {
      func = thisBinding[key];
    }
    if (this instanceof bound) {
      thisBinding = baseCreate(func.prototype);
      var result = func.apply(thisBinding, args);
      return isObject(result) ? result : thisBinding;
    }
    return func.apply(thisBinding, args);
  }
  setBindData(bound, bindData);
  return bound;
}

module.exports = baseCreateWrapper;

},{"lodash._basecreate":49,"lodash._setbinddata":39,"lodash._slice":53,"lodash.isobject":65}],49:[function(require,module,exports){
module.exports=require(45)
},{"lodash._isnative":50,"lodash.isobject":65,"lodash.noop":51}],50:[function(require,module,exports){
module.exports=require(36)
},{}],51:[function(require,module,exports){
module.exports=require(41)
},{}],52:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * Checks if `value` is a function.
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 */
function isFunction(value) {
  return typeof value == 'function';
}

module.exports = isFunction;

},{}],53:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * Slices the `collection` from the `start` index up to, but not including,
 * the `end` index.
 *
 * Note: This function is used instead of `Array#slice` to support node lists
 * in IE < 9 and to ensure dense arrays are returned.
 *
 * @private
 * @param {Array|Object|string} collection The collection to slice.
 * @param {number} start The start index.
 * @param {number} end The end index.
 * @returns {Array} Returns the new array.
 */
function slice(array, start, end) {
  start || (start = 0);
  if (typeof end == 'undefined') {
    end = array ? array.length : 0;
  }
  var index = -1,
      length = end - start || 0,
      result = Array(length < 0 ? 0 : length);

  while (++index < length) {
    result[index] = array[start + index];
  }
  return result;
}

module.exports = slice;

},{}],54:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * This method returns the first argument provided to it.
 *
 * @static
 * @memberOf _
 * @category Utilities
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'name': 'fred' };
 * _.identity(object) === object;
 * // => true
 */
function identity(value) {
  return value;
}

module.exports = identity;

},{}],55:[function(require,module,exports){
(function (global){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isNative = require('lodash._isnative');

/** Used to detect functions containing a `this` reference */
var reThis = /\bthis\b/;

/**
 * An object used to flag environments features.
 *
 * @static
 * @memberOf _
 * @type Object
 */
var support = {};

/**
 * Detect if functions can be decompiled by `Function#toString`
 * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
 *
 * @memberOf _.support
 * @type boolean
 */
support.funcDecomp = !isNative(global.WinRTError) && reThis.test(function() { return this; });

/**
 * Detect if `Function#name` is supported (all but IE).
 *
 * @memberOf _.support
 * @type boolean
 */
support.funcNames = typeof Function.name == 'string';

module.exports = support;

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"lodash._isnative":56}],56:[function(require,module,exports){
module.exports=require(36)
},{}],57:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var forIn = require('lodash.forin'),
    getArray = require('lodash._getarray'),
    isFunction = require('lodash.isfunction'),
    objectTypes = require('lodash._objecttypes'),
    releaseArray = require('lodash._releasearray');

/** `Object#toString` result shortcuts */
var argsClass = '[object Arguments]',
    arrayClass = '[object Array]',
    boolClass = '[object Boolean]',
    dateClass = '[object Date]',
    numberClass = '[object Number]',
    objectClass = '[object Object]',
    regexpClass = '[object RegExp]',
    stringClass = '[object String]';

/** Used for native method references */
var objectProto = Object.prototype;

/** Used to resolve the internal [[Class]] of values */
var toString = objectProto.toString;

/** Native method shortcuts */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * The base implementation of `_.isEqual`, without support for `thisArg` binding,
 * that allows partial "_.where" style comparisons.
 *
 * @private
 * @param {*} a The value to compare.
 * @param {*} b The other value to compare.
 * @param {Function} [callback] The function to customize comparing values.
 * @param {Function} [isWhere=false] A flag to indicate performing partial comparisons.
 * @param {Array} [stackA=[]] Tracks traversed `a` objects.
 * @param {Array} [stackB=[]] Tracks traversed `b` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(a, b, callback, isWhere, stackA, stackB) {
  // used to indicate that when comparing objects, `a` has at least the properties of `b`
  if (callback) {
    var result = callback(a, b);
    if (typeof result != 'undefined') {
      return !!result;
    }
  }
  // exit early for identical values
  if (a === b) {
    // treat `+0` vs. `-0` as not equal
    return a !== 0 || (1 / a == 1 / b);
  }
  var type = typeof a,
      otherType = typeof b;

  // exit early for unlike primitive values
  if (a === a &&
      !(a && objectTypes[type]) &&
      !(b && objectTypes[otherType])) {
    return false;
  }
  // exit early for `null` and `undefined` avoiding ES3's Function#call behavior
  // http://es5.github.io/#x15.3.4.4
  if (a == null || b == null) {
    return a === b;
  }
  // compare [[Class]] names
  var className = toString.call(a),
      otherClass = toString.call(b);

  if (className == argsClass) {
    className = objectClass;
  }
  if (otherClass == argsClass) {
    otherClass = objectClass;
  }
  if (className != otherClass) {
    return false;
  }
  switch (className) {
    case boolClass:
    case dateClass:
      // coerce dates and booleans to numbers, dates to milliseconds and booleans
      // to `1` or `0` treating invalid dates coerced to `NaN` as not equal
      return +a == +b;

    case numberClass:
      // treat `NaN` vs. `NaN` as equal
      return (a != +a)
        ? b != +b
        // but treat `+0` vs. `-0` as not equal
        : (a == 0 ? (1 / a == 1 / b) : a == +b);

    case regexpClass:
    case stringClass:
      // coerce regexes to strings (http://es5.github.io/#x15.10.6.4)
      // treat string primitives and their corresponding object instances as equal
      return a == String(b);
  }
  var isArr = className == arrayClass;
  if (!isArr) {
    // unwrap any `lodash` wrapped values
    var aWrapped = hasOwnProperty.call(a, '__wrapped__'),
        bWrapped = hasOwnProperty.call(b, '__wrapped__');

    if (aWrapped || bWrapped) {
      return baseIsEqual(aWrapped ? a.__wrapped__ : a, bWrapped ? b.__wrapped__ : b, callback, isWhere, stackA, stackB);
    }
    // exit for functions and DOM nodes
    if (className != objectClass) {
      return false;
    }
    // in older versions of Opera, `arguments` objects have `Array` constructors
    var ctorA = a.constructor,
        ctorB = b.constructor;

    // non `Object` object instances with different constructors are not equal
    if (ctorA != ctorB &&
          !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) &&
          ('constructor' in a && 'constructor' in b)
        ) {
      return false;
    }
  }
  // assume cyclic structures are equal
  // the algorithm for detecting cyclic structures is adapted from ES 5.1
  // section 15.12.3, abstract operation `JO` (http://es5.github.io/#x15.12.3)
  var initedStack = !stackA;
  stackA || (stackA = getArray());
  stackB || (stackB = getArray());

  var length = stackA.length;
  while (length--) {
    if (stackA[length] == a) {
      return stackB[length] == b;
    }
  }
  var size = 0;
  result = true;

  // add `a` and `b` to the stack of traversed objects
  stackA.push(a);
  stackB.push(b);

  // recursively compare objects and arrays (susceptible to call stack limits)
  if (isArr) {
    // compare lengths to determine if a deep comparison is necessary
    length = a.length;
    size = b.length;
    result = size == length;

    if (result || isWhere) {
      // deep compare the contents, ignoring non-numeric properties
      while (size--) {
        var index = length,
            value = b[size];

        if (isWhere) {
          while (index--) {
            if ((result = baseIsEqual(a[index], value, callback, isWhere, stackA, stackB))) {
              break;
            }
          }
        } else if (!(result = baseIsEqual(a[size], value, callback, isWhere, stackA, stackB))) {
          break;
        }
      }
    }
  }
  else {
    // deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`
    // which, in this case, is more costly
    forIn(b, function(value, key, b) {
      if (hasOwnProperty.call(b, key)) {
        // count the number of properties.
        size++;
        // deep compare each property value.
        return (result = hasOwnProperty.call(a, key) && baseIsEqual(a[key], value, callback, isWhere, stackA, stackB));
      }
    });

    if (result && !isWhere) {
      // ensure both objects have the same number of properties
      forIn(a, function(value, key, a) {
        if (hasOwnProperty.call(a, key)) {
          // `size` will be `-1` if `a` has more properties than `b`
          return (result = --size > -1);
        }
      });
    }
  }
  stackA.pop();
  stackB.pop();

  if (initedStack) {
    releaseArray(stackA);
    releaseArray(stackB);
  }
  return result;
}

module.exports = baseIsEqual;

},{"lodash._getarray":58,"lodash._objecttypes":60,"lodash._releasearray":61,"lodash.forin":72,"lodash.isfunction":64}],58:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var arrayPool = require('lodash._arraypool');

/**
 * Gets an array from the array pool or creates a new one if the pool is empty.
 *
 * @private
 * @returns {Array} The array from the pool.
 */
function getArray() {
  return arrayPool.pop() || [];
}

module.exports = getArray;

},{"lodash._arraypool":59}],59:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used to pool arrays and objects used internally */
var arrayPool = [];

module.exports = arrayPool;

},{}],60:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used to determine if values are of the language type Object */
var objectTypes = {
  'boolean': false,
  'function': true,
  'object': true,
  'number': false,
  'string': false,
  'undefined': false
};

module.exports = objectTypes;

},{}],61:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var arrayPool = require('lodash._arraypool'),
    maxPoolSize = require('lodash._maxpoolsize');

/**
 * Releases the given array back to the array pool.
 *
 * @private
 * @param {Array} [array] The array to release.
 */
function releaseArray(array) {
  array.length = 0;
  if (arrayPool.length < maxPoolSize) {
    arrayPool.push(array);
  }
}

module.exports = releaseArray;

},{"lodash._arraypool":62,"lodash._maxpoolsize":63}],62:[function(require,module,exports){
module.exports=require(59)
},{}],63:[function(require,module,exports){
module.exports=require(31)
},{}],64:[function(require,module,exports){
module.exports=require(52)
},{}],65:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var objectTypes = require('lodash._objecttypes');

/**
 * Checks if `value` is the language type of Object.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // check if the value is the ECMAScript language type of Object
  // http://es5.github.io/#x8
  // and avoid a V8 bug
  // http://code.google.com/p/v8/issues/detail?id=2291
  return !!(value && objectTypes[typeof value]);
}

module.exports = isObject;

},{"lodash._objecttypes":66}],66:[function(require,module,exports){
module.exports=require(60)
},{}],67:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isNative = require('lodash._isnative'),
    isObject = require('lodash.isobject'),
    shimKeys = require('lodash._shimkeys');

/* Native method shortcuts for methods with the same name as other `lodash` methods */
var nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys;

/**
 * Creates an array composed of the own enumerable property names of an object.
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {Object} object The object to inspect.
 * @returns {Array} Returns an array of property names.
 * @example
 *
 * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
 * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
 */
var keys = !nativeKeys ? shimKeys : function(object) {
  if (!isObject(object)) {
    return [];
  }
  return nativeKeys(object);
};

module.exports = keys;

},{"lodash._isnative":68,"lodash._shimkeys":69,"lodash.isobject":65}],68:[function(require,module,exports){
module.exports=require(36)
},{}],69:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var objectTypes = require('lodash._objecttypes');

/** Used for native method references */
var objectProto = Object.prototype;

/** Native method shortcuts */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * A fallback implementation of `Object.keys` which produces an array of the
 * given object's own enumerable property names.
 *
 * @private
 * @type Function
 * @param {Object} object The object to inspect.
 * @returns {Array} Returns an array of property names.
 */
var shimKeys = function(object) {
  var index, iterable = object, result = [];
  if (!iterable) return result;
  if (!(objectTypes[typeof object])) return result;
    for (index in iterable) {
      if (hasOwnProperty.call(iterable, index)) {
        result.push(index);
      }
    }
  return result
};

module.exports = shimKeys;

},{"lodash._objecttypes":70}],70:[function(require,module,exports){
module.exports=require(60)
},{}],71:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * Creates a "_.pluck" style function, which returns the `key` value of a
 * given object.
 *
 * @static
 * @memberOf _
 * @category Utilities
 * @param {string} key The name of the property to retrieve.
 * @returns {Function} Returns the new function.
 * @example
 *
 * var characters = [
 *   { 'name': 'fred',   'age': 40 },
 *   { 'name': 'barney', 'age': 36 }
 * ];
 *
 * var getName = _.property('name');
 *
 * _.map(characters, getName);
 * // => ['barney', 'fred']
 *
 * _.sortBy(characters, getName);
 * // => [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred',   'age': 40 }]
 */
function property(key) {
  return function(object) {
    return object[key];
  };
}

module.exports = property;

},{}],72:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseCreateCallback = require('lodash._basecreatecallback'),
    objectTypes = require('lodash._objecttypes');

/**
 * Iterates over own and inherited enumerable properties of an object,
 * executing the callback for each property. The callback is bound to `thisArg`
 * and invoked with three arguments; (value, key, object). Callbacks may exit
 * iteration early by explicitly returning `false`.
 *
 * @static
 * @memberOf _
 * @type Function
 * @category Objects
 * @param {Object} object The object to iterate over.
 * @param {Function} [callback=identity] The function called per iteration.
 * @param {*} [thisArg] The `this` binding of `callback`.
 * @returns {Object} Returns `object`.
 * @example
 *
 * function Shape() {
 *   this.x = 0;
 *   this.y = 0;
 * }
 *
 * Shape.prototype.move = function(x, y) {
 *   this.x += x;
 *   this.y += y;
 * };
 *
 * _.forIn(new Shape, function(value, key) {
 *   console.log(key);
 * });
 * // => logs 'x', 'y', and 'move' (property order is not guaranteed across environments)
 */
var forIn = function(collection, callback, thisArg) {
  var index, iterable = collection, result = iterable;
  if (!iterable) return result;
  if (!objectTypes[typeof iterable]) return result;
  callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
    for (index in iterable) {
      if (callback(iterable[index], index, collection) === false) return result;
    }
  return result
};

module.exports = forIn;

},{"lodash._basecreatecallback":73,"lodash._objecttypes":94}],73:[function(require,module,exports){
arguments[4][38][0].apply(exports,arguments)
},{"lodash._setbinddata":74,"lodash.bind":77,"lodash.identity":91,"lodash.support":92}],74:[function(require,module,exports){
module.exports=require(39)
},{"lodash._isnative":75,"lodash.noop":76}],75:[function(require,module,exports){
module.exports=require(36)
},{}],76:[function(require,module,exports){
module.exports=require(41)
},{}],77:[function(require,module,exports){
arguments[4][42][0].apply(exports,arguments)
},{"lodash._createwrapper":78,"lodash._slice":90}],78:[function(require,module,exports){
arguments[4][43][0].apply(exports,arguments)
},{"lodash._basebind":79,"lodash._basecreatewrapper":84,"lodash._slice":90,"lodash.isfunction":89}],79:[function(require,module,exports){
arguments[4][44][0].apply(exports,arguments)
},{"lodash._basecreate":80,"lodash._setbinddata":74,"lodash._slice":90,"lodash.isobject":83}],80:[function(require,module,exports){
arguments[4][45][0].apply(exports,arguments)
},{"lodash._isnative":81,"lodash.isobject":83,"lodash.noop":82}],81:[function(require,module,exports){
module.exports=require(36)
},{}],82:[function(require,module,exports){
module.exports=require(41)
},{}],83:[function(require,module,exports){
module.exports=require(65)
},{"lodash._objecttypes":94}],84:[function(require,module,exports){
arguments[4][48][0].apply(exports,arguments)
},{"lodash._basecreate":85,"lodash._setbinddata":74,"lodash._slice":90,"lodash.isobject":88}],85:[function(require,module,exports){
arguments[4][45][0].apply(exports,arguments)
},{"lodash._isnative":86,"lodash.isobject":88,"lodash.noop":87}],86:[function(require,module,exports){
module.exports=require(36)
},{}],87:[function(require,module,exports){
module.exports=require(41)
},{}],88:[function(require,module,exports){
module.exports=require(65)
},{"lodash._objecttypes":94}],89:[function(require,module,exports){
module.exports=require(52)
},{}],90:[function(require,module,exports){
module.exports=require(53)
},{}],91:[function(require,module,exports){
module.exports=require(54)
},{}],92:[function(require,module,exports){
module.exports=require(55)
},{"lodash._isnative":93}],93:[function(require,module,exports){
module.exports=require(36)
},{}],94:[function(require,module,exports){
module.exports=require(60)
},{}],95:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var keys = require('lodash.keys');

/**
 * Creates an array composed of the own enumerable property values of `object`.
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {Object} object The object to inspect.
 * @returns {Array} Returns an array of property values.
 * @example
 *
 * _.values({ 'one': 1, 'two': 2, 'three': 3 });
 * // => [1, 2, 3] (property order is not guaranteed across environments)
 */
function values(object) {
  var index = -1,
      props = keys(object),
      length = props.length,
      result = Array(length);

  while (++index < length) {
    result[index] = object[props[index]];
  }
  return result;
}

module.exports = values;

},{"lodash.keys":96}],96:[function(require,module,exports){
arguments[4][67][0].apply(exports,arguments)
},{"lodash._isnative":97,"lodash._shimkeys":98,"lodash.isobject":100}],97:[function(require,module,exports){
module.exports=require(36)
},{}],98:[function(require,module,exports){
module.exports=require(69)
},{"lodash._objecttypes":99}],99:[function(require,module,exports){
module.exports=require(60)
},{}],100:[function(require,module,exports){
module.exports=require(65)
},{"lodash._objecttypes":101}],101:[function(require,module,exports){
module.exports=require(60)
},{}],102:[function(require,module,exports){
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
  .controller('UserConvListCtrl',
    require('./controller/user_conversation_list'))
  .controller('PublicConvListCtrl',
    require('./controller/public_conversation_list'))
  .controller('CreateConversationCtrl',
    require('./controller/create_conversation'))
  .controller('HeadlineCtrl', require('./controller/headline'))
  .controller('MessageLogCtrl', require('./controller/message_log'))
  .controller('SendMessageCtrl', require('./controller/send_message'))
  .controller('ParticipantListCtrl', require('./controller/participant_list'))
  .controller('UserListCtrl', require('./controller/user_list'))
  ;


},{"../package.json":109,"./controller/config":1,"./controller/create_conversation":3,"./controller/headline":4,"./controller/message_log":5,"./controller/participant_list":6,"./controller/public_conversation_list":7,"./controller/send_message":8,"./controller/user_conversation_list":9,"./controller/user_list":10,"./directive/focus_on":12,"./factory/socket":13,"./service/command":103,"./service/conversation":104,"./service/message":105,"./service/notification":106,"./service/sound":107,"./service/user":108,"angular":16,"angular-animate":14,"angular-socket-io":15,"angularjs-scroll-glue":18}],103:[function(require,module,exports){
'use strict';

module.exports = function(
  socket,
  MessageService,
  ConversationService,
  UserService) {

  this.process = function(text) {
    if (text && text.charAt(0) === '/') {
      parse(text);
      return true;
    } else {
      return false;
    }
  };

  function parse(input) {
    var words = input.split(' ');
    var command = words[0]
                  .substring(1, words[0].length)
                  .toLowerCase();
    words.shift();
    var argument = words.join(' ');
    switch (command) {
      case 'join':
        ConversationService.joinOrSwitchTo(argument);
        break;
      case 'create':
        ConversationService.create(argument);
        break;
      case 'nick':
        UserService.changeName(argument);
        break;
      case 'leave':
        ConversationService.leave();
        break;
      /*
      TODO Makes no sense unless a user can join multiple conversations!
      case 'add':
        ConversationService.addUserToConversation(argument);
        break;
      */
      default:
        MessageService.displaySystemMessage('Unknown command: ' + command);
        break;
    }
  }
};

},{}],104:[function(require,module,exports){
'use strict';

var _    = {};
_.omit   = require('lodash.omit');
_.values = require('lodash.values');

module.exports = function(socket, $rootScope) {

  var conversations = {};

  var currentConversation = {};

  this.getUserConversations = function() {
    return filter(function(conversation) {
      return !conversation.participates;
    });
  };

  this.getPublicConversations = function() {
    return filter(function(conversation) {
      return conversation.participates || !conversation.public;
    });
  };

  function filter(fn) {
    // 1. _.omit: filter conversations according to given filter function (for
    // user conversations or public conversations),
    // 2. _.values: convert object to array and finally
    // 3. sort by name
    return sort(_.values(_.omit(conversations, fn)));
  }

  function sort(c) {
    return c.sort(function (a, b) {
      if (a.name > b.name) {
        return 1;
      } else if (a.name < b.name) {
        return -1;
      } else {
        return 0;
      }
    });
  }

  this.getCurrentConversation = function() {
    return currentConversation;
  };

  this.switchTo = function(conversation) {
    deactivateCurrentConversation();
    currentConversation = conversation;
    activateCurrentConversation();
  };

  this.join = function(conversation) {
    var convToServer;
    if (conversation.id) {
      convToServer = {
        id: conversation.id,
        name: conversation.name,
      };
    } else {
      convToServer = {
        name: conversation.name,
      };
    }
    socket.emit('join-conversation', convToServer);
  };

  this.joinOrSwitchTo = function(conversationName) {
    for (var c in conversations) {
      var conversation = conversations[c];
      if (conversation.name.toUpperCase() === conversationName.toUpperCase()) {
        this.switchTo(conversation);
        return;
      }
    }

    // try to join a public conversation with the given name, that the user does
    // not yet participate in.
    this.join({ name: conversationName });
  };

  socket.on('join-result', function(result) {
    var conversation = result.conversation;
    if (!conversation) {
      return;
    }

    conversation.participates = true;
    deactivateCurrentConversation();

    mergeServerConversation(conversation);
    currentConversation = conversations[conversation.id];
    activateCurrentConversation();
  });

  this.leave = function() {
    if (currentConversation) {
      socket.emit('leave-conversation', currentConversation.id);
    }
    $rootScope.$emit('user-left-conversation', currentConversation.id);
    currentConversation = null;
  };

  this.create = function(conversationName) {
    socket.emit('create-conversation', { name: conversationName });
  };

  /*
  TODO Makes no sense unless a user can join multiple conversations!
  this.addUserToCurrentConversation = function(user) {
    socket.emit('add-user-to-conversation', {
      user: user,
      conversation: currentConversation.name,
    });
  };
  */

  socket.on('user-conversation-list', function(conversationsFromServer) {
    log.trace('user-conversation-list');
    log.trace(JSON.stringify(conversationsFromServer, null, 2));
    for (var c in conversationsFromServer) {
      conversationsFromServer[c].participates = true;
    }
    merge(conversationsFromServer);
  });

  socket.on('public-conversation-list', function(conversationsFromServer) {
    log.trace('public-conversation-list');
    log.trace(JSON.stringify(conversationsFromServer, null, 2));
    for (var c in conversationsFromServer) {
      conversationsFromServer[c].public = true;
    }
    merge(conversationsFromServer);
  });

  socket.on('conversation-added', function(conversation) {
    addFromServerIfNotPresent(conversation);
  });

  socket.on('conversation-removed', function(conversationId) {
    delete conversations[conversationId];
  });

  function merge(conversationsFromServer) {
    // create all conversations that come from server and do not yet exist on
    // client
    for (var c in conversationsFromServer) {
      mergeServerConversation(conversationsFromServer[c]);
    }

    // delete all conversations that exist on client but not on server anymore
    for (var clientConvId in conversations) {
      var foundMatching = false;
      for (var serverConvId in conversationsFromServer) {
        if (clientConvId === serverConvId) {
          // found a matching server conversation, continue with next client
          // conversation
          foundMatching = true;
          break;
        }
      }

      // no matching conversation found in server conversations, so delete the
      // client conversation
      if (!foundMatching) {
        delete conversations[clientConvId];
      }
    }
  }

  function mergeServerConversation(serverConversation) {
    if (!addFromServerIfNotPresent(serverConversation)) {
      // conversation was already present on client - copy all properties
      // from server conversation to client conversation, just in case they
      // diverged.
      var clientConversation = conversations[serverConversation.id];
      clientConversation.name = serverConversation.name;
      if (angular.isDefined(serverConversation.participates)) {
        clientConversation.participates = serverConversation.participates;
      }
      if (angular.isDefined(serverConversation.public)) {
        clientConversation.public = serverConversation.public;
      }
    }
  }

  function addFromServerIfNotPresent(conversation) {
    if (!conversations[conversation.id]) {
      addFromServer(conversation);
      return true;
    }
    return false;
  }

  function addFromServer(conversation) {
    conversations[conversation.id] = conversation;
  }

  function deactivateCurrentConversation() {
    if (currentConversation) {
      currentConversation.active = false;
    }
  }

  function activateCurrentConversation() {
    if (currentConversation) {
      currentConversation.active = true;
    }
  }
};

},{"lodash.omit":19,"lodash.values":95}],105:[function(require,module,exports){
'use strict';

module.exports = function(socket,
  $rootScope,
  ConversationService,
  UserService,
  SoundService,
  NotificationService) {

  var self = this;
  var messages = {};

  function createMessage(text) {
    var clientTime = Date.now();
    var currentConversation = ConversationService.getCurrentConversation();
    if (!currentConversation) {
      return;
    }
    // TODO Only send user's id and nick, not the full object
    return {
      sender: UserService.getUser(),
      conversation: currentConversation.id,
      text: text,
      clientTime: clientTime,
      clientId: clientTime + '-' + randomString(),
      system: false,
    };
  }

  function createSystemMessage(text) {
    var clientTime = Date.now();
    var currentConversation = ConversationService.getCurrentConversation();
    if (!currentConversation) {
      return;
    }
    return {
      sender: { nick: '::' },
      conversation: currentConversation.id,
      text: text,
      clientTime: clientTime,
      clientId: clientTime + '-' + randomString(),
      system: true,
    };
  }

  function format(message) {
    formatSender(message);
    formatTime(message);
    formatText(message);
    message.classes = message.system ? ['system-message'] : [];
    return message;
  }

  function formatSender(message) {
    if (message.sender && message.sender.nick != null) {
      message.formattedSender = message.sender.nick;
    } else {
      message.formattedSender = '?';
    }
  }

  function formatTime(message) {
    if (message.serverTime || message.clientTime) {
      var date = new Date(message.serverTime || message.clientTime);
      message.formattedTime =
      ' [' +
      date.toLocaleDateString() +
      ' - ' +
      date.toLocaleTimeString() +
      ']:'
      ;
    } else {
      message.formattedTime = '[?]';
    }
    return message;
  }

  function formatText(message) {
    if (message.text) {
      message.formattedText = message.text;
    } else {
      message.formattedText = '';
    }
  }

  function randomString()  {
    return ('' + Math.random()).substr(2, 4);
  }

  this.getMessages = function() {
    var currentConversation = ConversationService.getCurrentConversation();
    if (!currentConversation) {
      return [];
    }
    var conversationId = currentConversation.id;
    return messages[conversationId];
  };

  this.send = function(text) {
    var message = createMessage(text);
    this.addLocally(angular.copy(message));
    socket.emit('message', message);
  };

  this.displaySystemMessageInCurrentConversation = function(text) {
    var message = createSystemMessage(text);
    this.addLocally(message);
  };

  this.displaySystemMessageInConversation = function(text, conversationId) {
    var message = createSystemMessage(text);
    message.conversation = conversationId;
    this.addLocally(message);
  };

  this.addLocally = function(message) {
    var conversationId = message.conversation;
    if (!conversationId) {
      log.error('Message without conversation id:');
      log.error(JSON.stringify(message));
      return;
    }
    format(message);
    log.debug('adding message:');
    log.debug(JSON.stringify(message, null, 2));
    var convLog = messages[conversationId];
    if (!convLog) {
      convLog = [];
      messages[conversationId] = convLog;
    }
    convLog.push(message);
  };

  socket.on('message', function (message) {
    self.addLocally(message);
    SoundService.playSound('ping');
    NotificationService.notify(message);
  });

  socket.on('message-old', function (message) {
    self.addLocally(message);
  });

  $rootScope.$on('user-left-conversation', function(event, conversationId) {
    delete messages[conversationId];
  });

  $rootScope.$on('display-system-message', function(event, message) {
    if (!message.conversation) {
      return;
    }
    if (message.conversation === '*') {
      self.displaySystemMessageInCurrentConversation(message.text);
    } else {
      self.displaySystemMessageInConversation(message.text,
        message.conversation);
    }
  });
};

},{}],106:[function(require,module,exports){
'use strict';

module.exports = function (socket) {

  var notificationsChecked = false;
  var notificationsEnabled = false;
  var notificationMessageCount = 0;
  var notificationMessage;
  var notificationTimeoutId;

  this.areNotificationsEnabled = function() {
    return notificationsEnabled;
  };

  this.toggleNotificationsEnabled = function() {
    notificationsEnabled = !notificationsEnabled;
    if (notificationsEnabled) {
      requestNotificationPermission();
    }
    socket.emit('enable-notifications', notificationsEnabled);
  };

  this.setNotificationsEnabled = function(enabled) {
    notificationsEnabled = enabled;
  };

  this.notify = function(message) {
    log.debug('notfiy(' + JSON.stringify(message) +')');
    notifyLater(message);
  };

  function notifyLater(message) {
    log.debug('notificationsEnabled: ' + notificationsEnabled);
    if (!notificationsEnabled) { return; }
    if (!notificationsChecked) {
      if (!notificationsEnabled) { return; }

      // Does not work in Chrome because we are not in a onClick handler:
      // https://code.google.com/p/chromium/issues/detail?id=274284
      // As a remedy we also ask for permission when the user activates
      // notifications.
      requestNotificationPermission();
      if (!notificationsEnabled) { return; }
    }
    // Overwrite current notificationMessage on purpose - only notify for
    // message received last in time period.
    notificationMessage = message;
    notificationMessageCount++;
    if (!notificationTimeoutId) {
      notificationTimeoutId = setTimeout(notifyNow, 3000);
    }
  }

  function requestNotificationPermission() {
    if (notificationsChecked) {
      return;
    }
    notificationsEnabled = notificationsEnabled &&
        Notify.prototype.isSupported();
    if (!notificationsEnabled) { return; }
    if (Notify.prototype.needsPermission()) {
      Notify.prototype.requestPermission();
    }
    notificationsChecked = true;
  }

  function notifyNow() {
    notificationTimeoutId = null;
    var title = 'New Message';
    if (notificationMessageCount >= 2) {
      title = notificationMessageCount + ' New Messages';
    }
    var notification = new Notify(title, {
      body: notificationMessage.formattedSender +
      ': ' + notificationMessage.formattedText,
    });
    notification.show();
    notificationMessageCount = 0;
  }
};

},{}],107:[function(require,module,exports){
'use strict';

module.exports = function (socket) {

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
};

},{}],108:[function(require,module,exports){
'use strict';

var _    = {};
_.omit   = require('lodash.omit');
_.values = require('lodash.values');

module.exports = function(
  socket,
  $rootScope,
  ConversationService,
  SoundService,
  NotificationService) {

  var user = { nick: 'You', online: true };
  var allUsers = {};
  var usersPerConversation = {};

  this.getUser = function() {
    log.trace('getUser');
    log.trace(JSON.stringify(user, null, 2));
    return user;
  };

  this.getParticipants = function(conversation) {
    log.trace('getParticipants');
    if (!conversation) {
      return [];
    }
    if (!usersPerConversation[conversation.id]) {
      return [];
    }
    return sort(_.values(usersPerConversation[conversation.id]));
  };

  this.getAllUsers = function() {
    log.trace('getAllUsers');
    log.trace(JSON.stringify(allUsers, null, 2));
    return sort(_.values(allUsers));
  };

  function sort(u) {
    return u.sort(function (a, b) {
      if (a.online && !b.online) {
        return -1;
      } else if (!a.online && b.online) {
        return 1;
      } else if (a.nick > b.nick) {
        return 1;
      } else if (a.nick < b.nick) {
        return -1;
      } else {
        return 0;
      }
    });
  }

  this.changeName = function(name) {
    socket.emit('set-name', name);
  };

  socket.on('set-name-result', function(result) {
    var text;
    log.debug('set-name-result');
    log.debug(JSON.stringify(result, null, 2));
    if (result.success) {
      log.debug('set-name-result: success');
      user.nick = result.name;
      text = 'You are now known as ' + user.nick + '.';
    } else {
      log.debug('set-name-result: failure');
      text = result.message;
    }

    $rootScope.$emit('display-system-message', {
      text: text,
      conversation: '*',
    });
  });

  socket.on('init-user-result', function(_user) {
    var message;
    log.debug('init-user-result');
    log.debug(JSON.stringify(_user, null, 2));
    user = _user;
    allUsers[user.id] = user;
    replaceUserInAllCollections(user);
    $.cookie('id', user.id);
    SoundService.setSoundEnabled(user.soundEnabled);
    NotificationService.setNotificationsEnabled(user.notificationsEnabled);
  });

  socket.on('user-joined', function(userJoinedData) {
    log.debug('user-joined');
    log.debug(JSON.stringify(userJoinedData, null, 2));
    var _user = userJoinedData.user;
    var conversationId = userJoinedData.conversationId;
    usersPerConversation[conversationId][_user.id] = _user;
    replaceUserInAllCollections(_user);
    $rootScope.$emit('display-system-message', {
      text: _user.nick + ' has joined this conversation.',
      conversation: conversationId,
    });
  });

  socket.on('user-left', function(userLeftData) {
    log.debug('user-left');
    log.debug(JSON.stringify(userLeftData, null, 2));
    var _user = userLeftData.user;
    var conversationId = userLeftData.conversationId;
    delete
      usersPerConversation[conversationId][_user.userId];
    $rootScope.$emit('display-system-message', {
      text: _user.nick + ' has left this conversation.',
      conversation: conversationId,
    });
  });

  socket.on('user-went-offline', function(id) {
    log.debug('user-went-offline');
    log.debug(id);
    var u = allUsers[id];
    if (u) {
      u.online = false;
    }
  });

  socket.on('user-coming-online', function(id) {
    log.debug('user-coming-online');
    log.debug(id);
    var u = allUsers[id];
    if (u) {
      u.online = true;
    }
  });

  socket.on('user-changed', function(_user) {
    log.debug('user-changed');
    log.debug(JSON.stringify(_user, null, 2));
    replaceUserInAllCollections(_user);
    /*
    var id = _user.id;
    var userNow = allUsers[id];
    if (userNow) {
      log.debug('user-changed - user is present');
      var previousName = u.nick;
      u.nick = result.name;
      $rootScope.$emit('display-system-message', {
        text: userNow.nick + ' is now known as ' + _user.nick + '.',
        conversation: '*',
      });
    }
    */
  });

  socket.on('user-list', function(users) {
    log.debug('user-list');
    log.debug(JSON.stringify(users, null, 2));
    allUsers = users;
    replaceAllUsersInAllCollections(allUsers);
  });

  socket.on('participant-list', function(participantData) {
    log.debug('participant-list');
    log.debug(JSON.stringify(participantData, null, 2));
    usersPerConversation[participantData.conversationId] =
      participantData.participants;
    replaceAllUsersInAllCollections(
      usersPerConversation[participantData.conversationId]);
  });

  function replaceAllUsersInAllCollections(usersFromServer) {
    // replace all user objects in each collection of users we track
    for (var u in usersFromServer) {
      var userFromServer = usersFromServer[u];
      replaceUserInAllCollections(userFromServer);
    }
    // replace the current user object with the fresh object from the server
    if (usersFromServer[user.id]) {
      user = usersFromServer[user.id];
    }
  }

  function replaceUserInAllCollections(userFromServer) {
    replaceUserInCollection(userFromServer, allUsers);
    forUsersInEachConversation(function(usersInConvesation) {
      replaceUserInCollection(userFromServer, usersInConvesation);
    });
  }

  function replaceUserInCollection(userFromServer, users) {
    if (users[userFromServer.id]) {
      users[userFromServer.id] = userFromServer;
    }
  }

  function forUsersInEachConversation(fn) {
    for (var c in usersPerConversation) {
      fn(usersPerConversation[c]);
    }
  }
};

},{"lodash.omit":19,"lodash.values":95}],109:[function(require,module,exports){
module.exports={
  "name": "plowderye",
  "version": "0.0.0",
  "description": "Yet another chat implementation with Node.js and Socket.io",
  "repository": "https://github.com/basti1302/plowderye.git",
  "main": "plowderye.js",
  "dependencies": {
    "async": "^0.2.10",
    "cookie": "^0.1.1",
    "express": "^3.4.8",
    "gen-id": "^0.1.1",
    "level": "^0.18.0",
    "lodash": "^2.4.1",
    "mime": "^1.2.11",
    "nconf": "^0.6.9",
    "node-uuid": "^1.4.1",
    "socket.io": "^0.9.16",
    "through": "^2.3.4",
    "winston": "^0.7.2"
  }
}

},{}]},{},[102]);