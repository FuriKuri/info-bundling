var net = require('net');

function print(buffer) {
	var index = buffer.indexOf("}");
  if (index !== -1) {
  	var msg = buffer.substring(0, index + 1);
  	buffer = buffer.substring(index + 1);
		console.log(msg);
		return print(buffer);
  } else {
  	return buffer;
  }
}

var server = net.createServer(function(c) {
	var buffer = "";
  console.log('client connected');
  c.on('end', function() {
    console.log('client disconnected');
  });
  c.on('data', function(data) {
  	buffer = print(buffer + data.toString());
	});
});
server.listen(1337, function() {
  console.log('server bound');
});