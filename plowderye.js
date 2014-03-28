'use strict';

var express = require('express')
  , app    = express()
  , http   = require('http')
  , server = http.createServer(app)
  , fs     = require('fs')
  , path   = require('path')
  , nconf  = require('nconf')
  ;

// TODO SSL for http requests and websocket
// TODO Caching static files, configurable (disable) per env
// TODO compressing middleware and more stuff for delivering static files
// efficiently
// see http://blog.modulus.io/nodejs-and-express-static-content

var configurationFile = path.resolve(path.join(__dirname, 'plowderye.json'));
var defaultDataDir = path.resolve(path.join(__dirname, 'data'));
nconf.argv()
     .env()
     .file({ file: configurationFile })
     .defaults({
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

var logger = require('./lib/logger');

app.use(express.cookieParser());
app.use(express.static(__dirname + '/public'));

var port = nconf.get('port');
logger.info('Using http port: %d', port);
server.listen(port);

var connectionHandler = require('./lib/connection_handler');
connectionHandler.listen(server);
