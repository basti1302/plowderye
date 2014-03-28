'use strict';

var winston = require('winston')
 , Logger   = winston.Logger
 , Console  = winston.transports.Console
 , File     = winston.transports.File
 , nconf    = require('nconf')
 ;

var consoleOpts = nconf.get('logging:console');
var fileOpts = nconf.get('logging:file');
var transports = [];
if (isEnabled(consoleOpts.enabled)) {
  transports.push(new Console(consoleOpts));
}
if (isEnabled(fileOpts.enabled)) {
  transports.push(new File(fileOpts));
}

var exceptionConsoleOpts = nconf.get('logging:exceptions:console');
var exceptionFileOpts    = nconf.get('logging:exceptions:file');
var exceptionHandlers = [];
if (isEnabled(exceptionConsoleOpts.enabled)) {
  exceptionHandlers.push(new Console(exceptionConsoleOpts));
}
if (isEnabled(exceptionFileOpts.enabled)) {
  exceptionHandlers.push(new File(exceptionFileOpts));
}

var loggingConf = {
  transports: transports,
  exitOnError: nconf.get('exit-on-error'),
};

if (isEnabled(exceptionConsoleOpts.enabled) || isEnabled(exceptionFileOpts.enabled)) {
  loggingConf.exceptionHandlers = exceptionHandlers;
}

function isEnabled(option) {
  if (typeof option === 'undefined' || option === null) {
    return false;
  }
  else if (typeof option === 'boolean') {
    return option;
  } else if (typeof option === 'string') {
    return option.toLowerCase() === 'true';
  } else {
    return false;
  }
}

module.exports = new (winston.Logger)(loggingConf);
