var net = require('net'),
    format = require('util').format,
    client = new net.Socket(),
    config = require('../nodeserv.json');

var log4js = require('log4js'),
    logger = log4js.getLogger();

var { nick, user, channel, port, server } = config;

client.connect(port, server, () => {
  logger.info('Connected...');

  logger.info('Sending NICK...');
  client.write(format('NICK %s\n', nick));

  logger.info('Sending USER...');
  client.write(format('USER %s %s %s :This is just a test bot called nodeserv\n', user, user, user));

});

client.on('data', (data) => {
  logger.info('Received: ' + data);

  // channel message
  // Received: :Ada!~textual@3e234504.6a774e3d.97ef59f1.IP4 PRIVMSG #miketest :Hello

  // private message
  // Received: :Ada!~textual@3e234504.6a774e3d.97ef59f1.IP4 PRIVMSG nodeserv :Test private message

  var ping = /(PING)\s:([^\n]+)/.exec(data);
  var privmsg = /(PRIVMSG)\s(#\w+)\s\:([^\n]+)/.exec(data);

  // https://tools.ietf.org/html/rfc1459#section-4.6.2
  if (ping) {
    var sendPing = 'PONG ' + ping[2] +'\n';
    logger.info('Sending ' + sendPing)
    client.write(sendPing);

    logger.info('Sending JOIN...');
    client.write(format('JOIN %s\n', channel));
  }

  // test echo
  if (privmsg) {
    var command = privmsg[1],
        receiver = privmsg[2],
        text = privmsg[3];

    logger.info('Array: ', command, receiver, text);

    // no idea why adding text with a space after #channel doesn't show the string
    var writeString = format('PRIVMSG %s ' + privmsg[3] +'\n', channel);
    client.write(writeString);

    if (text == /^!"/.test) {
      logger.info(text)
      client.write('!" found');
    }
  }

});

client.on('close', () => {
  logger.info('Connection closed');
});

client.on('error', (err) => {
  logger.warn(err);
});

// process
process.stdin.setEncoding('utf8');

process.stdin.on('readable', () => {
  var chunk = process.stdin.read();
  if (chunk !== null) {
    process.stdout.write('data: ' + chunk);

    // write to channel
    var writeString = format('PRIVMSG %s ' + chunk +'\n', channel);
    client.write(writeString);
  }
});

process.stdin.on('end', function() {
  process.stdout.write('end');
});
