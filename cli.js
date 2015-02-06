#!/usr/bin/env node
var meow = require('meow');
var Server = require('./lib');

var cli = meow({
  help: [
    'Usage',
    '  info-bundling <options>',
    '',
    'Options',
    '  --port <port>    Port which the server is listen to. Default port is 1337.'
  ].join('\n')
});
var port = 1337;
if (cli.flags.port) {
  port = cli.flags.port;
}
console.log('Starting standalone server on port ' + port + ' ...');
new Server().startServer(port);