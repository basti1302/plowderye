'use strict';

var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app);

// TODO Caching static files, configurable (disable) per env
// TODO compressing middleware and more stuff for delivering static files
// efficiently
// see http://blog.modulus.io/nodejs-and-express-static-content

app.use(express.cookieParser());
app.use(express.static(__dirname + '/public'));

server.listen(3000);

var connectionHandler = require('./lib/connection_handler');
connectionHandler.listen(server);
