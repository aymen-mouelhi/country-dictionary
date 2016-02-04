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
    describe("Get Country By Name", function() {
        it("should return all countries", function() {
            expect(countryDict.getAllCountries().length).to.equal(countries.length);
        });
    });

    // Get All countries
    describe("Check Country is in Continent", function() {
        it("should check if country is in Europe", function() {
            var country = 'Egypt';

            countryDict.inEurope(country, function(error, found){
            	expect(found).to.equal(false);
            });
        });
    });
});
