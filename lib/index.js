var net = require('net');
var clc = require('cli-color');
var Jetty = require("jetty");
var jetty = new Jetty(process.stdout);

var connectionState = new Map();

function printStatus() {
  jetty.clear();
  jetty.moveTo([0,0]);
  for (var value of connectionState.values()) {
    jetty.text(value.name + " " + clc.green(value.status));
  }
}

function print(buffer, c) {
	var index = buffer.indexOf("}");
  if (index !== -1) {
  	var msg = buffer.substring(0, index + 1);
  	buffer = buffer.substring(index + 1);
    connectionState.set(c, JSON.parse(msg));
    printStatus();
		return print(buffer, c);
  } else {
  	return buffer;
  }
}


var server = net.createServer(function(c) {
  connectionState.set(c, {
    name: "", 
    status: ""
  });
	var buffer = "";
  c.on('end', function() {
    setTimeout(function() {
      connectionState.delete(c);
    }, 10000);
  });
  c.on('data', function(data) {
  	buffer = print(buffer + data.toString(), c);
	});
});
server.listen(1337, function() {
  console.log('server bound');
});