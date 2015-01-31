var net = require('net');
var clc = require('cli-color');
var Jetty = require("jetty");
var jetty = new Jetty(process.stdout);

var level = {
  info: clc.blue,
  error: clc.red,
  ok: clc.green,
  warning: clc.yellow
}

function slice(string, length) {
  var s = string.substring(0, length);
  return new String(new Array(length).join(" ") + s).slice(s.length)
}

function printStatus(connectionState) {
  jetty.clear();
  jetty.moveTo([0,0]);
  for (var value of connectionState.values()) {
    jetty.text(slice(value.name, 30) + " - " + level[value.level](slice(value.status, 30)));
    jetty.text('\n');
  }
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
  return state;
}

function print(buffer, c, connectionState) {
	var index = buffer.indexOf("}");
  if (index !== -1) {
  	var msg = buffer.substring(0, index + 1);
  	buffer = buffer.substring(index + 1);
    try {
      connectionState.set(c, createStateObject(msg, c));
    } catch (e) {
      // ignore invalid messages
    }
    printStatus(connectionState);
		return print(buffer, c);
  } else {
  	return buffer;
  }
}

module.exports = function(port) {
  var connectionState = new Map();

  var server = net.createServer(function(c) {
    connectionState.set(c, {
      name: "Connected", 
      status: "Connecting...",
      level: "warning"
    });
    var buffer = "";
    c.on('end', function() {
      setTimeout(function() {
        connectionState.delete(c);
      }, 10000);
    });
    c.on('data', function(data) {
      buffer = print(buffer + data.toString(), c, connectionState);
    });
  });
  server.listen(port, function() {
    console.log('server bound');
  });
}

