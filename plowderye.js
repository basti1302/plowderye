'use strict';

var express = require('express')
  , app    = express()
  , http   = require('http')
  , server = http.createServer(app)
  , nconf  = require('nconf')
  ;

// TODO SSL for http requests and websocket
// TODO Caching static files, configurable (disable) per env
// TODO compressing middleware and more stuff for delivering static files
// efficiently
// see http://blog.modulus.io/nodejs-and-express-static-content

require('./lib/config');

var logger = require('./lib/logger');

app.use(express.cookieParser());
app.use(express.static(__dirname + '/public'));

app.engine('ejs', require('ejs').renderFile);

var jsFile = nconf.get('dev') ?
             'plowderye-client.dev.js' :
             'plowderye-client.min.js';
app.get('/', function(req, res) {
  res.render('index.ejs', { jsFile: jsFile, });
});

var port = nconf.get('port');
logger.info('Using http port: %d', port);
server.listen(port);

var connectionHandler = require('./lib/connection_handler');
connectionHandler.listen(server);
