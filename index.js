var _ = require('underscore');
var request = require('request');
var languages = require('language-list')();
var countries = require('./data/countries.json');


var CountryDictionary = function(opts) {
    //defaults
    opts = opts || {};
    // API key
    this.GMapsApiKey = opts.GMapsApiKey || '';
    // MapBox API Key
    this.MapBoxApiKey = opts.MapBoxApiKey || '';
};


/**
 * This method creates and returns and instance of CountryDictionary
 * @param {Object} opts Options passed along to the CountryDictionary constructor.
 */
var createInstance = function(opts) {
    return new CountryDictionary(opts);
};


/**
 * Sets API Key for CountryDictionary Google Maps Geocoding API access.
 * @param {String} [key] [API Key]
 */
CountryDictionary.prototype.setGMapsAPIKey = function(key) {
    this.GMapsApiKey = key;
};

/**
 * Set API Key for MapBox
 * @param {[type]} key [description]
 */
CountryDictionary.prototype.setMapBoxAPIKey = function(key) {
    this.MapBoxApiKey = key;
};


/**
 * Get All countries
 * @return {[type]} [description]
 */
CountryDictionary.prototype.getAllCountries = function() {
    return countries;
};


/**
 * Get country's capital
 * @param  {[type]} country [description]
 * @return {[type]}         [description]
 */
CountryDictionary.prototype.getCapital = function(country) {
    country = this.getCountryByName(country);
    // found?
    if (country) {
        return country.capital;
    }
};


/**
 * Get country's phoneIndex
 * @param  {[type]} country [description]
 * @return {[type]}         [description]
 */
CountryDictionary.prototype.getPhoneIndex = function(country) {
    country = this.getCountryByName(country);
    // found?
    if (country) {
        return country.phone;
    }
};


/**
 * Get country's currency
 * @param  {[type]} country [description]
 * @return {[type]}         [description]
 */
CountryDictionary.prototype.getCurrency = function(country) {
    country = this.getCountryByName(country);
    // found?
    if (country) {
        return country.currency;
    }
};

/**
 * Get country's spoken languages
 * @param  {[type]} country [description]
 * @return {[type]}         [description]
 */
CountryDictionary.prototype.getLanguages = function(country) {
    country = this.getCountryByName(country);

    var languagesList = [];
    // found?
    if (country) {

        _.each(country.languages.split(','), function(language, i) {
            languagesList.push(languages.getLanguageName(language))
        });
    }

    return languagesList;
};

/**
 * Get country's continent
 * @param  {[type]} country [description]
 * @return {[type]}         [description]
 */
CountryDictionary.prototype.getContinent = function(country) {
    country = this.getCountryByName(country);
    // found?
    if (country) {
        return country.continent;
    }
};

/**
 * Get All cities in a country
 * @param  {[type]}   country  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
CountryDictionary.prototype.getCities = function(country, callback) {
    country = this.getCountryByName(country);
    // found?
    if (country) {
        this._getCities(country, callback);
    }
};

/**
 * Get Country By Name
 * @param  {String} country Country's Name
 * @return {[type]}         [description]
 */
CountryDictionary.prototype.getCountryByName = function(country) {
    // to title case
    country = country.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });

    return countries[_.indexOf(_.pluck(countries, 'name'), country)];
};

/**
 * get Country By Phone Index
 * @param  {String} phone [description]
 * @return {[type]}       [description]
 */
CountryDictionary.prototype.getCountryByPhoneIndex = function(phone) {
    phone = phone.replace('+', '');
    return countries[_.indexOf(_.pluck(countries, 'phone'), phone)];
};

/**
 * [getCountryByCapital description]
 * @param  {[type]} capital [description]
 * @return {[type]}         [description]
 */
CountryDictionary.prototype.getCountryByCapital = function(capital) {
    return countries[_.indexOf(_.pluck(countries, 'capital'), capital)];
};

/**
 * Get country from given address
 * @param  {String}   address  Address
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
CountryDictionary.prototype.getCountryByAddress = function(address, callback) {
    var self = this;
    if (!this.GMapsApiKey) {
        // exception: method needs GMapsApiKey
        callback("Google Maps API key is needed to find places")
    } else {

        var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key=' + this.GMapsApiKey;
        // Get info
        request(url, function(error, response, html) {
            if (error) {
                return callback(error);
            }
            try {
                if (JSON.parse(html).results[0]) {
                    var data = JSON.parse(html).results[0].address_components;

                    _.each(_.pluck(data, 'types'), function(val, i) {
                        if (val.indexOf('country') > -1) {
                            var country = data[i].long_name;
                            callback(null, self.getCountryByName(country));
                        }
                    });
                } else {
                    // check map box
                    url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + address + '.json?access_token=' + this.MapBoxApiKey;

                    request(url, function(error, response, html) {
                        if (error) {
                            return callback(error);
                        } else {
                            //console.info("mapbox html: " + html);
                            if (html) {
                                if (!JSON.parse(html).hasOwnProperty('message')) {
                                    var data = JSON.parse(html).features[0];
                                    if (data) {
                                        _.each(data.context, function(context, i) {
                                            if (context.id.indexOf('country') > -1) {
                                                var country = context.text;
                                                callback(null, self.getCountryByName(country));
                                            }
                                        });
                                    } else {
                                        callback("[MapBox] No results found for " + address);
                                    }
                                } else {
                                    callback("[MapBox] No results found for " + address);
                                }

                            } else {
                                callback("No results found for " + address);
                            }

                        }
                    });
                }
            } catch (err) {
                // check map box
                url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + address + '.json?access_token=' + this.MapBoxApiKey;

                request(url, function(error, response, html) {
                    if (error) {
                        return callback(error);
                    } else {
                        console.info("mapbox html: " + html);
                        if (html) {
                            if (!JSON.parse(html).hasOwnProperty('message')) {
                                var data = JSON.parse(html).features[0];
                                if (data) {
                                    _.each(data.context, function(context, i) {
                                        if (context.id.indexOf('country') > -1) {
                                            var country = context.text;
                                            callback(null, self.getCountryByName(country));
                                        }
                                    });
                                } else {
                                    callback("[MapBox] No results found for " + address);
                                }
                            } else {
                                callback("[MapBox] No results found for " + address);
                            }

                        } else {
                            callback("No results found for " + address);
                        }

                    }
                });
            }
        });
    }
};

/**
 * [getCountriesByCurrency description]
 * @param  {[type]}   currency [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
CountryDictionary.prototype.getCountriesByCurrency = function(currency, callback) {
    var currencyCountries = [];
    var currencies = _.pluck(countries, 'currency');

    _.each(currencies, function(val, i) {
        if (val === currency) {
            currencyCountries.push(countries[i]);
        }
    });

    callback(null, currencyCountries);
};

/**
 * [getCountriesByContinent description]
 * @param  {[type]}   continent [description]
 * @param  {Function} callback  [description]
 * @return {[type]}             [description]
 */
CountryDictionary.prototype.getCountriesByContinent = function(continent, callback) {
    var continentCountries = [];
    var continents = _.pluck(countries, 'continent');

    _.each(continents, function(val, i) {
        if (val === continent) {
            continentCountries.push(countries[i]);
        }
    });

    callback(null, continentCountries);
};

/**
 * [getCountriesByLanguage description]
 * @param  {[type]}   language [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
CountryDictionary.prototype.getCountriesByLanguage = function(language, callback) {
    var languageCountries = [];
    var languagesList = _.pluck(countries, 'languages');

    if (language.length > 2) {
        // Get language code for given language
        language = languages.getLanguageCode(language);
    }

    _.each(languagesList, function(val, i) {
        if (_.indexOf(val.split(','), language) > -1) {
            languageCountries.push(countries[i]);
        }
    });

    callback(null, languageCountries);;
};

/**
 * Check if given address is in Europe
 * @param  {[type]}   address  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
CountryDictionary.prototype.inEurope = function(address, callback) {
    var country = this.getCountryByName(address);

    // Address is a country
    if (country) {
        if (country.continent === 'EU') {
            return callback(null, true);
        } else {
            return callback(null, false);
        }
    } else {
        // Get which country
        this.getCountryByAddress(address, function(error, country) {
            if (error) {
                callback(error);
            } else {
                // Search the JSON
                if (country.continent === 'EU') {
                    return callback(null, true);
                } else {
                    callback(null, false);
                }
            }
        });
    }
};

CountryDictionary.prototype.inEuropeSync = function(country) {
    var country = this.getCountryByName(country);

    // Address is a country
    if (country) {
        if (country.continent === 'EU') {
            return true;
        } else {
            return false;
        }
    }
    return false;
};

/**
 * Check if given address is in Africa
 * @param  {[type]}   address  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
CountryDictionary.prototype.inAfrica = function(address, callback) {
    var country = this.getCountryByName(address);

    // Address is a country
    if (country) {
        if (country.continent === 'AF') {
            return callback(null, true);
        } else {
            callback(null, false);
        }
    } else {
        // Get which country
        this.getCountryByAddress(address, function(error, country) {
            if (error) {
                callback(error);
            } else {
                // Search the JSON
                if (country.continent === 'AF') {
                    return callback(null, true);
                } else {
                    callback(null, false);
                }
            }
        });
    }
};

/**
 * Check if given address is in Asia
 * @param  {[type]}   address  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
CountryDictionary.prototype.inAsia = function(address, callback) {
    var country = this.getCountryByName(address);

    // Address is a country
    if (country) {
        if (country.continent === 'AS') {
            callback(null, true);
        } else {
            callback(null, false);
        }
    } else {
        // Get which country
        this.getCountryByAddress(address, function(error, country) {
            if (error) {
                callback(error);
            } else {
                // Search the JSON
                if (country.continent === 'AS') {
                    return callback(null, true);
                } else {
                    callback(null, false);
                }
            }
        });
    }
};

/**
 * Check if given address is in NorthAmerica
 * @param  {[type]}   address  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
CountryDictionary.prototype.inNorthAmerica = function(address, callback) {
    var country = this.getCountryByName(address);

    // Address is a country
    if (country) {
        if (country.continent === 'NA') {
            callback(null, true);
        } else {
            callback(null, false);
        }
    } else {
        // Get which country
        this.getCountryByAddress(address, function(error, country) {
            if (error) {
                callback(error);
            } else {
                // Search the JSON
                if (country.continent === 'NA') {
                    return callback(null, true);
                } else {
                    callback(null, false);
                }
            }
        });
    }
};

/**
 * Check if given address is in Oceania
 * @param  {[type]}   address  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
CountryDictionary.prototype.inOceania = function(address, callback) {
    var country = this.getCountryByName(address);

    // Address is a country
    if (country) {
        if (country.continent === 'OC') {
            callback(null, true);
        } else {
            callback(null, false);
        }
    } else {
        // Get which country
        this.getCountryByAddress(address, function(error, country) {
            if (error) {
                callback(error);
            } else {
                // Search the JSON
                if (country.continent === 'OC') {
                    return callback(null, true);
                } else {
                    callback(null, false);
                }
            }
        });
    }
};

/**
 * Check if given address is in SouthAmerica
 * @param  {[type]}   country  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
CountryDictionary.prototype.inSouthAmerica = function(country, callback) {
    var country = this.getCountryByName(address);

    // Address is a country
    if (country) {
        if (country.continent === 'SA') {
            callback(null, true);
        } else {
            callback(null, false);
        }
    } else {
        // Get which country
        this.getCountryByAddress(address, function(error, country) {
            if (error) {
                callback(error);
            } else {
                // Search the JSON
                if (country.continent === 'SA') {
                    return callback(null, true);
                } else {
                    callback(null, false);
                }
            }
        });
    }
};

/**
 * Check if given address is in Antarctica
 * @param  {[type]}   address  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
CountryDictionary.prototype.inAntarctica = function(address, callback) {
    var country = this.getCountryByName(address);

    // Address is a country
    if (country) {
        if (country.continent === 'AN') {
            callback(null, true);
        } else {
            callback(null, false);
        }
    } else {
        // Get which country
        this.getCountryByAddress(address, function(error, country) {
            if (error) {
                callback(error);
            } else {
                // Search the JSON
                if (country.continent === 'AN') {
                    return callback(null, true);
                } else {
                    callback(null, false);
                }
            }
        });
    }
};

module.exports = createInstance;