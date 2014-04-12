'use strict';

var fs     = require('fs')
  , nconf  = require('nconf')
  , path   = require('path')
  ;

var rootDir = path.join(__dirname, '..');
console.log('root dir  : ' + rootDir);
var configurationFile = path.resolve(path.join(rootDir, 'plowderye.json'));
console.log('config dir: ' + configurationFile);
var defaultDataDir = path.resolve(path.join(rootDir, 'data'));
console.log('default data dir: ' + defaultDataDir);

nconf.argv()
 .env()
 .file({ file: configurationFile })
 .defaults({
   dev: false,
   port: 3000,
   data: defaultDataDir,
   'default-conversation-name': 'Lobby',
   'exit-on-error': false,
   logging: {
     console: {
       enabled: true,
       level: 'info',
       colorize: true,
       json: false,
       timestamp: true,
     },
     file: {
       enabled: false,
       filename: path.resolve(path.join(__dirname, 'plowderye.log')),
       level: 'info',
       colorize: false,
       json: false,
       timestamp: true,
     },
     exceptions: {
       console: {
         enabled: false,
         level: 'error',
         colorize: false,
         json: false,
         timestamp: true,
       },
       file: {
         enabled: false,
         filename: path.resolve(path.join(__dirname, 'plowderye-error.log')),
         level: 'error',
         colorize: false,
         json: false,
         timestamp: true,
       },
     },
   },
 });
