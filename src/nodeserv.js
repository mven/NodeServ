var net = require('net'),
    format = require('util').format,
    client = new net.Socket(),
    config = require('../nodeserv.json'),
    google = require('google');

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

  var ping = /(PING)\s:([^\n]+)/.exec(data);
  var privmsg = /(PRIVMSG)\s(#\w+)\s\:([^\n]+)/.exec(data);

  /**
   * PING
   * Client needs to send pong if ping received
   *
   * example:
   * Received: :Ada!~textual@3e234504.6a774e3d.97ef59f1.IP4 PRIVMSG nodeserv :Test private message
   *
   * More info: https://tools.ietf.org/html/rfc1459#section-4.6.2
   */
  if (ping) {
    var sendPing = 'PONG ' + ping[2] +'\n';
    logger.info('Sending ' + sendPing)
    client.write(sendPing);

    logger.info('Sending JOIN...');
    client.write(format('JOIN %s\n', channel));
  }

  /**
   * PRIVMSG
   * message in channel or by user
   *
   * channel message example:
   * Received: :Ada!~textual@3e234504.6a774e3d.97ef59f1.IP4 PRIVMSG #miketest :Hello
   *
   * private message example:
   * Received: :Ada!~textual@3e234504.6a774e3d.97ef59f1.IP4 PRIVMSG nodeserv :Test private message
   */

  if (privmsg) {
    var command = privmsg[1],
        receiver = privmsg[2],
        text = privmsg[3];

    // no idea why adding text with a space after #channel doesn't show the string
    // var writeString = format('PRIVMSG %s ' + privmsg[3] +'\n', channel);
    // client.write(writeString);

    // quote search
    if (/^!"/.test(text)) {
      logger.info(text);
      // randomize quote
    }

    // google search
    if (/^!g/.test(text)) {

      query = text.replace('!g ', '');

      google(query, function (err, res) {

        if (err) {
          logger.error(err);
          return;
        }

        var writeString = format('PRIVMSG %s ' + res.links[0].link +'\n', channel);
        client.write(writeString);

      });
    }
  }
});

client.on('close', () => {
  logger.info('Connection closed');
});

client.on('error', (err) => {
  logger.error(err);
});

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
