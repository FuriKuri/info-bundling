var net = require('net');
var server = net.createServer(function(c) {
  console.log('client connected');
  c.on('end', function() {
    console.log('client disconnected');
  });
  c.on('data', function(data) {
    console.log(data.toString());
	});
});
server.listen(1337, function() {
  console.log('server bound');
});