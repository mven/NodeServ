var format = require('util').format,
    client = require('./lib/client');

var log4js = require('log4js'),
    logger = log4js.getLogger();

// Allow client to write to channel
process.stdin.setEncoding('utf8');

process.stdin.on('readable', () => {

  var chunk = process.stdin.read();
  if (chunk !== null) {
    process.stdout.write('data: ' + chunk);

    var writeString = format('PRIVMSG %s ' + chunk +'\n', channel);
    client.write(writeString);
  }
});

process.stdin.on('end', function() {
  process.stdout.write('end');
});
