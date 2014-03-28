'use strict';

var forEachConv = require('../for_each_conversation')
  , logger = require('../logger')
  , messageUtil = require('../message_util')
  , nameAvailable = require('../name_available')
  , storage = require('../storage')
  ;

module.exports = function(request, name) {
  logger.debug('%s set-name: %j', request.id, name);
  if (!isAllowed(name)) {
    process.nextTick(function() {
      emitNotAllowed(request);
    });
  } else {
    nameAvailable.isAvailable(name, null, function(err, available) {
      if (err || !available) {
        emitNotAvailable(request);
      } else {
        processNameChange(request, name);
      }
    });
  }
};

function isAllowed(name) {
  return name.indexOf('Guest') != 0;
};

function emitNotAllowed(request) {
  logger.debug('%s set-name: name not allowed.', request.id);
  request.socket.emit('set-name-result', {
    success: false,
    message: 'Names cannot begin with "Guest".'
  });
}

function emitNotAvailable(request) {
  logger.debug('%s set-name: name not available.', request.id);
  request.socket.emit('set-name-result', {
    success: false,
    message: 'That name is already in use.'
  });
}

function processNameChange(request, name) {
  rename(request, name);
  request.socket.emit('set-name-result', {
    success: true,
    name: name
  });
  var broadcastObject = {
    id: request.user.id,
    name: name,
  };
  logger.debug('%s set-name: broadcast: %j', request.id, broadcastObject, {});
  forEachConv(request, function(conversation) {
      messageUtil.broadcast(request.socket, conversation, 'name-changed', broadcastObject);
  });
}

function rename(request, name) {
  logger.debug('%s rename(%s)', request.id, name);
  var previousName = request.user.nick;
  storage.changeUserName(request.user, previousName, name)
  request.user.nick = name;
  storage.storeUser(request.user);
  logger.debug('%s renamed from %s to %s', request.id, previousName, request.user.nick);
};
