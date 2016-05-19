var chai = require('chai');
var expect = chai.expect;
var CountryDict = require('../index');
var countryDict = new CountryDict();
var countries = require('../data/countries.json');

describe("Country Dictionary API", function() {
    // Get Country By Phone Name
    describe("Get Country By Name", function() {
        var name = 'France';

        it("should return country for given name", function() {
            expect(countryDict.getCountryByName(name).phone).to.equal('33');
        });
    });

    // Get Country By Phone Index
    describe("Get Country By Phone Index", function() {
        var phone = '33';

        it("should return country for given phone index", function() {
            expect(countryDict.getCountryByPhoneIndex(phone).name).to.equal('France');
        });
    });

    // Get All countries
    describe("Get All Countries", function() {
        it("should return all countries", function() {
            expect(countryDict.getAllCountries().length).to.equal(countries.length);
        });
    });

    // Get All countries in a continent
    describe("Get All Countries in Continent", function() {
        it("should return all countries in a Continent", function() {
            var contient = 'EU';

            countryDict.getCountriesByContinent(contient, function(error, countries) {
                expect(countries.length).to.equal(53);
            });
        });
    });

        // Get All countries having same currency
    describe("Get All Countries in Continent", function() {
        it("should return all countries in a Continent", function() {
            var currency = 'EUR';

            countryDict.getCountriesByCurrency(currency, function(error, countries) {
                expect(countries.length).to.equal(34);
            })
        });
    });

    // Check Country is in Continent
    describe("Check Country is in Continent", function() {
        it("should check if country is in Europe", function() {
            var country = 'Egypt';

            countryDict.inEurope(country, function(error, found) {
                expect(found).to.equal(false);
            });
        });
    });

    // Get Country's capital
    describe("Get country's capital", function() {
        it("should get the country's capital", function() {
            var country = 'Sweden';

            expect(countryDict.getCapital(country)).to.equal('Stockholm');
        });
    });


    // Get Country's spoken languages
    describe("Get country's languages", function() {
        it("should get the languages spoken in a country", function() {
            var country = 'Nauru';

            expect(countryDict.getLanguages(country)).to.deep.equal(['English', 'Nauruan']);
        });
    });

    // Get Country's spoken languages
    describe("Get France's cities", function() {
        it("should return 13266 French cities", function() {
            var country = 'France';

            countryDict.getCities(country, 1000, function(error, cities){
                expect(cities.length).to.equal(13266);
            });
        });
    });
});