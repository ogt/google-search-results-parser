var cheerio = require('cheerio');
var urlParser = require('url');
var querystring = require('querystring');
var fs = require('fs');

var clean = function (str) {
  // \u00A0 - NO-BREAK SPACE
  // \u200E - LEFT-TO-RIGHT MARK
  return str.replace(/\u200E/g, '').replace(/\u00A0/g, ' ').trim();
};

// get direct url from search result url
var urlFromParams = function (url, key) {
  var u = urlParser.parse(url);
  return querystring.parse(u.query)[key];
};

var Parser = {
  parseFile: function (file, callback) {
    var data = fs.readFileSync(file).toString();
    var result = Parser.parseString(data);
    if (callback) callback(result);
    return result;
  },

  parseString: function (string) {
    var $ = this.$ = cheerio.load(string);

    var results = {
      query_string: $('input[type=text][name=q]').val(),
      results:      this.parseResults($)
    };

    return results;
  },

  parseResults: function () {
    // TODO
    return [];
  }
};

exports.extended = Parser;