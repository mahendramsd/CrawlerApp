const express = require('express');
const router = express.Router();
const mysqlCoonection = require("../connection");
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const axios = require('axios');


const urls = "https://www.srilanka.travel/,http://www.tourismmin.gov.lk/";
var countrySet = new Set();
var cityMap = [];
var cityCountryMap = new Map();

/* GET index page. */
router.get('/', function (req, res, next) {

  // Load Location by database
  loadLocations();

  var array = fs.readFileSync('Keywords.txt').toString().split("\n");
  var urlArray = urls.split(",");

  // Iterate Url and Fetch web site data.
  urlArray.forEach(url => {
    fetchData(url).then((res) => {
      const html = res.data;
      const $ = cheerio.load(html);
      const statsTable = $('h1,h2,h3,h4,h5,h6,p,body');

      var matchedKeyWords = new Set();
      var matchedCountry = new Set();
      var matchedCity = new Set();
      var matchedLocations = new Set();

      statsTable.each(function () {
        let title = $(this).text();
        array.forEach(keyword => {
          if (title.includes(keyword.trim())) {
            matchedKeyWords.add(keyword.trim());
          }
        });

        // Find Matched Country
        countrySet.forEach(country => {
          if (title.includes(country)) {
            console.log("country" + country);
            matchedCountry.add(country);
          }
        });

        // Find Matched City
        cityMap.forEach(city => {
          if (title.includes(city)) {
            console.log("city" + city);
            matchedCity.add(city);
          }
        });

        // Add Unique Locations
        var locations = [];
        matchedCountry.forEach(c => {
          locations.push(c);
          matchedCity.forEach(city => {
            if (cityCountryMap.get(city) === c) {
              locations.push(city);
            }
          })
        });
        matchedLocations.add(locations.toString());

      });

      // Write To File 
      var file = `============================== \nURL: ${url}\nKeywords found: ${Array.from(matchedKeyWords).toString()}\nLocation mentioned: ${Array.from(matchedLocations).toString()}\n\n`;
      fs.appendFile("Response.txt", file, (error) => {
        if (!error) {
          console.log("File Write");
        } else {
          console.log(error);
        }
      });
    });

  });
  res.send('File Write Succesfully');
});


/**
 * Load web site 
 * @param {*} url 
 * @returns 
 */
async function fetchData(url) {
  console.log("Crawling web page data...");
  let response = await axios(url).catch((err) => console.log(err));
  if (response.status !== 200) {
    console.log("Error occurred while fetching data");
    return;
  }
  return response;
}

/**
 * Load locations from Database
 */
async function loadLocations() {
  console.log("Reading Locations...");
  await mysqlCoonection.query("SELECT l2.name AS city , l1.name AS country FROM locations l1 INNER JOIN locations l2  ON l1.id = l2.parent_id", (error, rows, fields) => {
    if (!error) {
      rows.forEach(line => {
        console.log("Country" + line.country);
        countrySet.add(line.country);
        console.log("City" + line.country);
        cityMap.push(line.city);
        cityCountryMap.set(line.city, line.country)
      })
    } else {
      console.log(error);
    }
  })
}
module.exports = router;
