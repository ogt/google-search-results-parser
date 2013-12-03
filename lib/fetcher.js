var querystring = require('querystring');
var needle = require('needle');
var childProcess = require('child_process');
var phantomjs = require('phantomjs');
var path = require('path');

var Fetcher = {
  defaultHeaders: {
    'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1677.0 Safari/537.36"
  },

  getStatic: function (url, callback) {
    needle.get(url, this.defaultHeaders, function (error, response, body) {
      //var result = Parser.parseString(body);
      if (callback) callback(body);
    });
  },

  getStaticWords: function (searchable, callback) {
    var query = {output: "search", sclient: "psy-ab", q: searchable, gbv: "1" }; //, sei: "CpyWUqHYO8ParAezgoDgDw" };
    var url = "https://www.google.com/search?" + querystring.stringify(query);
    this.getStatic(url, callback);
  },

  getExtended: function(url, callback) {
    var fetcherScript = path.join(__dirname, '../helpers/phantomjs_fetcher.js');
    var childArgs = [fetcherScript, '"' + url + '"'];

    //console.log(phantomjs.path + ' ' + fetcherScript + ' ' + '"' + url + '"');
    childProcess.execFile(phantomjs.path, childArgs, function(err, stdout) {
      /*
      console.log(err, stdout, stderr);
      stdout.split("\n").forEach(function(l) {
        console.log(l);
      })

      stderr.split("\n").forEach(function(l) {
        console.log(l);
      })
      */

      callback(stdout);
      // handle results
    });
  },

  getExtendedWords: function(searchable, callback) {
    var query = {q: searchable, oq: searchable, aqs: "chrome..69i57.250j0j9", sourceid: "chrome", ie: "UTF-8" };
    var url = "https://www.google.com/search?" + querystring.stringify(query);
    this.getExtended(url, callback);
  }
};

exports.fetcher = Fetcher;
