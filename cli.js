#!/usr/bin/env node

var Server = require('./lib');
console.log('Starting standalone server on port 1337...');
new Server().startServer(1337);