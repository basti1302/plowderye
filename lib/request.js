'use strict';

var storage = require('./storage');

function Request(id, user, socket) {
  this.id = id;
  this.user = user;
  this.socket = socket;
}

module.exports = Request;
