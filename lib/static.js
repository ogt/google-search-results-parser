var cheerio = require('cheerio');
var urlParser = require('url');
var querystring = require('querystring');
var fs = require('fs');

function log(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

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
      query_string: $('#sbhost').val(),
      results:      this.parseResults($)
    };

    return results;
  },

  parseResults: function ($) {
    return $('#ires > ol > li').map(function(i, el) {
      el = $(el);

      var type = this.detectType(el);

      var row = {
        Title: el.find('h3').text(),
        DisplayURL: el.find('cite').text(),
        URL: el.find('h3 a').attr('href'),
        CachedUrl: el.find('a:contains("Cached")').attr('href'),
        SimularUrl: el.find('a:contains("Similar")').attr('href'),
        Text: this.scrapText(el, type),
        Type: type,
        Extensions: []
      };

      if (row.Type != 'images') {
        row.DirectUrl = urlFromParams(row.URL, 'q');
        row.Domain = urlParser.parse(row.DirectUrl).host;
      }

      if (row.Type == 'plain') this.parseExtensionSiteLinks(row, el);
      this.parseExtensionRating(row, el);

      //result.results.push(row);
      return row;
    }.bind(this));
  },

  // get text for search slippet
  scrapText: function (el, type) {
    var content;

    if (type == 'plain') {
      content = el.find('h3 + div > span');
      var text = content.text();
      return text.replace(/^(\d+ days? ago|\d\d? hours? ago|\d\d? \w{3,4} \d{4}) ...\s*/, '');
    }

    if (type == 'video') {
      content = el.find('cite + span');
      content.find('> span').remove();
      return content.text();
    }

    if (type == 'news') {
      content = el.find('td > div > div > cite').parent().nextAll('div');
      return content.text();
    }
  },

  // type of result
  // plain, youtube, images, news
  detectType: function (el) {
    if (el.find('cite:contains("www.youtube.com/watch")').length || el.find('td > div > a > div').text().match(/►.*/)) {
      return 'video';
    } else if (el.find('h3 a[href^="/images?"]').length) {
      return 'images';
    } else if (el.find('a[href*="tbm=nws"]').length) {
      return 'news';
    } else {
      return 'plain';
    }
  },

  parseExtensionSiteLinks: function (row, el) {
    if (el.find('div.osl').length) {
      row.Extensions.Sitelinks = el.find('div.osl a').map(function (i, el) {
        el = this.$(el);
        return {
          Title: el.text(),
          URL: el.attr('href'),
          DirectURL: urlFromParams(el.attr('href'), 'q')
        };
      }.bind(this));
      return;
    }

    var table = el.find('table table');
    if (table.length) {
      var siteLinks = [];
      table.find('td:not([colspan]) > div').each(function(i, cell) {
        cell = this.$(cell);
        var link = {
          Title: cell.find('h3').text(),
          URL: cell.find('h3 a').attr('href'),
          Text: cell.find('div div').text()
        };

        link.DirectURL = urlFromParams(link.URL, 'q');
        siteLinks.push(link);
      }.bind(this));

      row.Extensions.Sitelinks = siteLinks;
    }
  },

  parseExtensionRating: function (row, el) {
    var ratingNode = el.find('div.star div');

    if (ratingNode.length) {
      var rating = {
        stars: parseInt(ratingNode.css('width'), 10) / 65 * 5
      };

      // Rating: 10/10 - 2 votes
      // Rating: 10/10 - Review by Andrew Williams
      var ratingText = ratingNode.parent().parent().text();
      if (ratingText.match(/Rating: \d{2}\/\d{2}/)) {
        var parts = ratingText.match(/Rating: (\d{1,2})\/(\d{1,2}).\-.((\d+)\svotes)?(Review by (.+))?/);
        rating.score = parts[1];
        rating.scoreOf = parts[2];
        if (parts[4]) rating.votes = parts[4];
        if (parts[6]) rating.reviewBy = parts[6];
      }
      row.Extensions.Rating = rating;
    }
  }
};

exports.static = Parser;