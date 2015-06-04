var Geo          = require('./geo.js'),
    Forecast     = require('./forecast.js'),
    render       = require('./renderer.js'),
    querystring  = require('querystring'),
    path         = require('path'),
    fs           = require('fs'),
    commonHeader = {'Content-Type': 'text/html'};

//Handle HTTP route for GET and POST
function home(request, response) { 
  var lookup = path.basename(decodeURI(request.url)),
      f = './' + lookup,
      mimeTypes = {
    '.js' : 'text/javascript',
    '.html': 'text/html',
    '.css' : 'text/css'
  };
  console.log("Lookup value: " + lookup);
  //if (lookup) {
    fs.readFile(f, function(error, data) {
      if (error) {
        response.writeHead(500);
        response.end('Server Error!');
      }

      var headers = {'Content-Type': mimeTypes[path.extname(lookup)]};
      response.writeHead(200, headers);
      console.log("Data Stream: " + data);
      response.end(data);
    });
  }
  
  if (request.url === '/') {
    if (request.method.toLowerCase() === 'get') {
      response.writeHead(200, commonHeader);
      render.view('header', {}, response);
      render.view('search', {}, response);
      render.view('footer', {}, response);
      response.end();
    } else {
      //if POST get the address
      request.on('data', function(postBody) {
        var query = querystring.parse(postBody.toString());
        response.writeHead(303, {'Location': '/' + query.address});
        response.end();
      });
    }
  }
}

//Handle HTTP route GET /:location ie. 90405 or 514 Pier Ave, Santa Monica, CA
function location(request, response) {
  var location = request.url.replace('/', '');
  if (location.length > 0) {
    response.writeHead(200, commonHeader);
    render.view('header', {}, response);

    //Get geolocation from Google 
    var geoLocation = new Geo(location);    
    geoLocation.on('end', function(geoJSON) {
      //make a generic values object and add with forecast
      var values = {
            city: geoJSON.results[0].address_components[1].long_name,
            state: geoJSON.results[0].address_components[3].short_name,
            address: geoJSON.results[0].formatted_address,
            latitude: geoJSON.results[0].geometry.location.lat,
            longitude: geoJSON.results[0].geometry.location.lng
          }
      
      //Write results of Google Geolocation
      //response.write("The weather forcast for " + values.address + " is:\n");
      //response.write("Latitude: " + geo.latitude + ". Longitude: " + geo.longitude + "\n");
      
      //Get JSON from Forecast.io with Geolocation coordinates
      var forecastLocation = new Forecast(values.latitude, values.longitude);
      forecastLocation.on('end', function(forecastJSON) {
        //add to values object
        values.summary = forecastJSON.currently.summary;
        values.temperature = forecastJSON.currently.temperature
        
        //Write the current temperature and weather summary
        //response.write("It's currently " + Math.round(values.temperature) + " degrees and " + values.summary + ".\n");
        render.view('forecast', values, response);
        render.view('footer', {}, response);
        response.end();
      });    
    });
    
    //on error
    geoLocation.on('error', function(error) {
      response.write(error.message + "\n");
      render.view('footer', {}, response);
      response.end();
    });
  }
}

//check if file is css
/*function extras(request, response) {
  var lookup = path.basename(decodeURI(request.url)),
      f = './' + lookup,
      mimeTypes = {
    '.js' : 'text/javascript',
    '.html': 'text/html',
    '.css' : 'text/css'
  };
  if (lookup) {
    fs.readFile(f, function(error, data) {
      if (error) {
        response.writeHead(500);
        response.end('Server Error!');
      }

      var headers = {'Content-Type': mimeTypes[path.extname(lookup)]};
      response.writeHead(200, headers);
      console.log(f);
      response.end(data);
    });
  }
} */


module.exports.home = home;
module.exports.location = location;
//module.exports.extras = extras;