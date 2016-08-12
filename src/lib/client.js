var path = require('path'),
    net = require('net'),
    client = new net.Socket(),
    write = require(path.join(__dirname, './write'))(client),
    config = require(path.join(__dirname, '../../nodeserv.json')),
    google = require('google');

var log4js = require('log4js'),
    logger = log4js.getLogger('IRC');

var { nick, user, channel, port, server } = config;

client.connect(port, server, () => {
  logger.info('Connected...');

  // send NICK
  write('NICK %s\n', nick);

  // send USER
  write('USER %s %s %s :This is just a test bot called nodeserv\n', user, user, user);

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
    write('JOIN %s\n', channel);
  }

  /**
   * PRIVMSG
   * message in channel or message from user
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

        write('PRIVMSG %s ' + res.links[0].link +'\n', channel);

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

module.exports = client;
