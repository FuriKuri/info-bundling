var net = require('net');
var notifier = require('node-notifier');
var print = require('./print');
var State = require('./state');

function repeat(interval, fn) {
  fn();
  setTimeout(repeat.bind(undefined, interval, fn), interval);
}

function notify(state) {
  if (state.notify) {
    notifier.notify({
      title: state.name,
      message: state.status,
      sound: true,
      wait: true
    }, function (err, response) {
    });
  }
}

function handleBuffer(buffer, c, connectionState, isNotifyEnabled) {
  var index = buffer.indexOf("}");
  if (index !== -1) {
    var msg = buffer.substring(0, index + 1);
    buffer = buffer.substring(index + 1);
    try {
      var state = new State(msg, c.remoteAddress);
      connectionState.set(c, state);
      if (isNotifyEnabled) {
        notify(state);
      }
    } catch (e) {
      // ignore invalid messages
    }
    return handleBuffer(buffer, c);
  } else {
    return buffer;
  }
}

function start(port) {
  var connectionState = new Map();
  var notify = this.notify;
  var server = net.createServer(function(c) {
    connectionState.set(c, {
      name: "Client connected",
      status: "Waiting...",
      level: "warning",
      group: "no group"
    });
    var buffer = "";
    c.on('end', function() {
      setTimeout(function() {
        connectionState.delete(c);
      }, 10000);
    });
    c.on('data', function(data) {
      buffer = handleBuffer(buffer + data.toString(), c, connectionState, notify);
    });
  });
  server.listen(port, function() {
    console.log('Server started...');
  });
  repeat(this.refresh, print.bind(undefined, connectionState));
}

module.exports = function(flags) {
  this.refresh = 2000;
  this.notify = true;
  if (flags) {
    if (flags.refresh) {
      this.refresh = flags.refresh;
    }
    if (flags.notify) {
      this.notify = flags.notify !== "false";
    }
  }
  this.startServer = start;
}
