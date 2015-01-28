var net = require('net');

var connectionState = new Map();

function printStatus() {
  console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");
  for (var value of connectionState.values()) {
    console.log(value.name + " " + value.status);
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
    setTimeout(10000, function() {
      connectionState.delete(c);
    });
  });
  c.on('data', function(data) {
  	buffer = print(buffer + data.toString(), c);
	});
});
server.listen(1337, function() {
  console.log('server bound');
});