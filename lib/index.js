var net = require('net');
var clc = require('cli-color');
var Jetty = require("jetty");
var jetty = new Jetty(process.stdout);
var notifier = require('node-notifier');

var level = {
  info: clc.blue,
  error: clc.red,
  ok: clc.green,
  warning: clc.yellow
}

function repeat(interval, fn) {
  fn();
  setTimeout(repeat.bind(undefined, interval, fn), interval);
}

function slice(string, length) {
  var s = string.substring(0, length);
  return new String(new Array(length).join(" ") + s).slice(s.length)
}

function fill(string, length) {
  var diff = length - string.length;
  return string + new Array(diff).join("-");
}

function compareState(a, b) {
  if (a.name > b.name) {
    return 1;
  }
  if (a.name < b.name) {
    return -1;
  }
  return 0;
}

function printStatus(connectionState) {
  jetty.clear();
  jetty.moveTo([0,0]);
  var groups = {};
  for (var value of connectionState.values()) {
    if (!groups[value.group]) {
      groups[value.group] = [];
    }
    groups[value.group].push(value);
  }
  Object.getOwnPropertyNames(groups).sort().forEach(function (group) {
    jetty.text(fill("----- " + group + " -", 63) + "\n");
    groups[group].sort(compareState).forEach(function (state) {
      jetty.text(slice(state.name, 30) + " - " + level[state.level](slice(state.status, 30)));
      jetty.text('\n');
    });
  });
}

function createStateObject(msg, c) {
  var state = JSON.parse(msg);
  if (!state.name) {
    state.name = c.remoteAddress;
  }
  if (!state.level) {
    state.level = "info";
  }
  if (!state.status) {
    state.status = "unknown";
    state.level = "warning";
  }
  if (!state.group) {
    state.group = "no group";
  }
  return state;
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

function handleBuffer(buffer, c, connectionState) {
  var index = buffer.indexOf("}");
  if (index !== -1) {
    var msg = buffer.substring(0, index + 1);
    buffer = buffer.substring(index + 1);
    try {
      var state = createStateObject(msg, c);
      connectionState.set(c, state);
      notify(state);
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
      buffer = handleBuffer(buffer + data.toString(), c, connectionState);
    });
  });
  server.listen(port, function() {
    console.log('Server started...');
  });
  repeat(this.refresh, printStatus.bind(undefined, connectionState));
}

module.exports = function(flags) {
  this.refresh = 2000;
  if (flags) {
    if (flags.refresh) {
      this.refresh = flags.refresh;
      console.log("Use " + this.refresh);
    }
  }
  this.startServer = start;
}