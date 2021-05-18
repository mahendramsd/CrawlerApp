var express = require('express');
var router = express.Router();
const fs = require('fs');
const lineReader = require('line-reader');

/* GET users listing. */
router.get('/', function (req, res, next) {
  lineReader.eachLine('Keywords.txt', function(line) {
    console.log(line);
});

});

router.get('/write', function (req, res, next) {
  var msg = "============================= \nURL: https://wwww.com\nKeywords found: Travel, Leisure\nLocation mentioned: Sri Lanka, Trinco, Aru\n\n";
  fs.appendFile("Response.txt", msg, (error) => {
    if (!error) {
      res.send('File Write Succesfully');
    } else {
      console.log(error);
    }
  });

});

module.exports = router;
