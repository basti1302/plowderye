var winston = require('winston')
 , Logger = winston.Logger
 , Console = winston.transports.Console
 //, File = winston.transports.File
 ;

var consoleOpts = {
  colorize: true,
  json: false,
  level: 'debug',
  timestamp: true,
};

var logger = new (winston.Logger) ({
  transports: [
    new Console(consoleOpts),
    /*new File({
      filename: __dirname + '/debug.log',
      json: false,
    }),*/
  ],
  /*
  exceptionHandlers: [
    new Console(consoleOpts),
    new File({
      filename: __dirname + '/exceptions.log',
      json: false,
    }),
  ],
  exitOnError: true
  */
});

module.exports = logger;
