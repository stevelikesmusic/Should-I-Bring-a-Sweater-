var https = require('https'),
    EventEmitter = require('events').EventEmitter,
    util = require('util');


//Get lat and long with Google Geocoding
//Use results with forecastCallback to get weather forecast
function Geo(address) {
  
  EventEmitter.call(this);  
  var geoEmitter = this;
      
  var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=AIzaSyDhAB6yN4yqFEHb7Vmo30blQP6i5PemN2I",
      request = https.get(url, function(response) {
      var body = "";

      if (response.statusCode !== 200) {
        request.abort();
        //Status Code Error
        geoEmitter.emit('error', new Error("There was an error looking up " + address + ". (" + https.STATUS_CODES[response.statusCode] + ")"));
      }
        
      response.on('data', function(chunk) {
        body += chunk;
        geoEmitter.emit('data', chunk);
      });

      response.on('end', function() {
        if (response.statusCode === 200) {
          try {
              var result = JSON.parse(body);
              geoEmitter.emit('end', result);
          } catch (error) {
              geoEmitter.emit('error', error); 
          }        
        }
      }).on('error', function(error) {
          geoEmitter.emit('error', error);
      });
  });
}

util.inherits(Geo, EventEmitter);

module.exports = Geo;

