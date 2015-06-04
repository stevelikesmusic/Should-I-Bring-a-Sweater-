var http = require('http'),
    route = require('./router.js');

http.createServer(function(request, response) {
  route.home(request, response);
  route.location(request, response);
  //route.extras(request, response);
}).listen(3000);
console.log("Server running on port 3000");