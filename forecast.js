var https = require('https'),
    EventEmitter = require('events').EventEmitter,
    util = require('util');


//Callback to get Forecast.io object with Google Geocoding results
function Forecast(lat, lng) {
  //Set Forecast to emit events
  EventEmitter.call(this);  
  var forecastEmitter = this;
  
  var url = 'https://api.forecast.io/forecast/9df7ff36d0c74a57d55d88cdcff00bc9/' + lat + ',' + lng,
      request = https.get(url, function(response) {
    var body = "";
    
    if (response.statusCode !== 200) {
            request.abort();
            //Status Code Error
            forecastEmitter.emit("error", new Error("There was an error getting the profile for " + lat + ", " + lng + ". (" + https.STATUS_CODES[response.statusCode] + ")"));
        }
    response.on('data', function(chunk) {
      body += chunk;
      forecastEmitter.emit('data', chunk);
    });
    
    response.on('end', function() {
      if(response.statusCode === 200) {
        try {
            var forecast = JSON.parse(body);
            forecastEmitter.emit('end', forecast);
        } catch(error) {
            forecastEmitter.emit('error', error);
        }
      }
    }).on('error', function(error) {
      forecastEmitter.emit('error', error);
    });
  });
}

util.inherits(Forecast, EventEmitter);

module.exports = Forecast