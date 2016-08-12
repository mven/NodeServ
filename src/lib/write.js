var format = require('util').format;

var log4js = require('log4js'),
    logger = log4js.getLogger('IRC');

module.exports = function(client) {

  return function(message, ...rest) {

    if(arguments.length > 1) {
      message = format(message, ...rest);
    }

    logger.info('Writing message to IRC:', message);

    return client.write(message);
  }

}
