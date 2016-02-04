
# Country Dictionary

> Node.JS Country Descriptor

This modules allows you to grab information about any country.

### Installation

```bash
$ npm install country-dictionary
```

### Example Code

```javascript
var _ = require('underscore');
var countryDict = require('country-dictionary')();

// Set Google Maps Geocoding API Key if you would like to find a country from an address
countryDict.setGMapsAPIKey('<API Key>');

// Or:
var CountryDict = require('country-dictionary');

var countryDict = new CountryDict({
    GMapsApiKey: '<API Key>'
});

// get All countries
var countries = countryDict.getAllCountries();

// get country by name
var country = countryDict.getCountryByName('France');

// get country by name
var country = countryDict.getCountryByPhoneIndex('49');

// get countries by language spoken
countryDict.getCountriesByLanguage('arabic', function(error, countries){
  _.each(_.pluck(countries, 'name'), function(country){
    console.log("country: " + country);
  });
});

// get countries by currency used
countryDict.getCountriesByCurrency('EUR', function(error, countries){
  _.each(_.pluck(countries, 'name'), function(country){
    console.log("country: " + country);
  });
});

// get countries by contient
countryDict.getCountriesByContinent('EU', function(error, countries){
  _.each(_.pluck(countries, 'name'), function(country){
    console.log("country: " + country);
  });
});

// check if country is in Europe
countryDict.inEurope('India', function(error, found){
    console.log("Seriously? " + found);
});


```

### Running Tests

	Tests can be found in /test/api.test.js

  ```bash
  $ npm test
  ```


### License (MIT)

Copyright (c) 2016, Aymen Mouelhi.

Author: [Aymen Mouelhi]

