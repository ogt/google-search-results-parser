var cheerio = require('cheerio');
var urlParser = require('url');
var querystring = require('querystring');
var fs = require('fs');

var clean = function (str) {
  if (str === undefined) return str;
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
        Text: clean(this.scrapText(el, type)),
        Type: type,
        Extensions: {}
      };

      if (row.Type != 'images') {
        if (row.URL.match(/^https?\/\/(www\.)?google.com\//)) {
          row.DirectUrl =  urlFromParams(row.URL, 'q');
        } else {
          row.DirectUrl = row.URL;
        }
        row.Domain = urlParser.parse(row.DirectUrl).host;
      }

      if (row.Type == 'plain') {
        this.parseExtensionSiteLinks(row, el);
        this.parseExtensionPublishedBy(row, el, $);
      }
      this.parseExtensionRating(row, el);

      return row;
    }.bind(this));
  },

  // get text for search slippet
  scrapText: function (el, type) {
    var content;

    if (type == 'plain') {
      content = el.find('cite').parent().parent().find('> span');
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
    if (el.find('cite:contains("www.youtube.com/watch")').length || el.find('h3 + div div > a > span').text().match(/►.*/)) {
      return 'video';
    } else if (el.find('h3 a[href^="/images?"], a[href*="/imgres?imgurl="]').length) {
      return 'images';
    } else if (el.find('a[href*="tbm=nws"]').length) {
      return 'news';
    } else {
      return 'plain';
    }
  },

  parseExtensionPublishedBy: function (row, el, $) {
    /*
    PublishedBy:
      Photo :
      Who :
      Date :
      Followers :
    */

    if (el.find('.authorship_link').length) {
      var link = $(el.find('.authorship_link')[0]);
      var cirles = el.find('.authorship_link ~ .authorship_link');
      row.Extensions.PublishedBy = {
        Who: link.text().replace(/^(More )?by\s+/, '')
      };
      if (cirles.length) {
        var value = cirles.text().match(/([\d,]+)/)[1].replace(/[^\d]/g, '');
        row.Extensions.PublishedBy.Followers = parseInt(value, 10);
      }
      var date = link.parent().next().find('span').text();
      if (date.length) {
        row.Extensions.PublishedBy.Date = date.replace(/\s+\-\s*$/, '');
      }
    }
  },

  parseExtensionSiteLinks: function (row, el) {
    if (el.find('div.osl').length) {
      row.Extensions.SiteLinks = el.find('div.osl a').map(function (i, el) {
        el = this.$(el);
        return {
          Title: el.text(),
          URL: el.attr('href'),
          DirectURL: el.attr('href').indexOf('google.com/') == -1 ?
            el.attr('href') :
            urlFromParams(el.attr('href'), 'q')
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

      row.Extensions.SiteLinks = siteLinks;
    }
  },

  parseExtensionRating: function (row, el) {
    var ratingNode = el.find('.csb .csb');
    var parts;

    if (ratingNode.length) {
      var rating = {
        stars: parseInt(ratingNode.css('width'), 10) / 65 * 5
      };

      // Rating: 10/10 - 2 votes
      // Rating: 10/10 - Review by Andrew Williams
      // Rating: 4.5 - ‎7,062 votes - ‎Free
      // Rating: 4.5 - ‎858 reviews - ‎Price range: $$$
      // Rating: 8.9/10 - ‎64 reviews
      // Rating: 4.8 - ‎50 reviews
      // Rating: 4 - ‎359 reviews - ‎Price range: $$
      // Rating: 4.1 - ‎1,496 votes
      var ratingText = clean(ratingNode.parent().parent().text());

      if (ratingText.match(/Rating: [\d\.]+\/[\d\.]+/)) {
        parts = ratingText.match(/Rating: ([\d\.]+)\/([\d\.]+)/);
        rating.score = parseFloat(parts[1], 10);
        rating.scoreOf = parseFloat(parts[2], 10);
      }

      if (ratingText.match(/Rating: [\d\.]+(\s|$)/)) {
        parts = ratingText.match(/Rating: ([\d\.]+)(\s|$)/);
        rating.score = parseFloat(parts[1], 10);
      }

      if (ratingText.match(/Rating: [\d\.\/]+ \- [\d\,]+ votes/)) {
        parts = ratingText.match(/([\d,]+) votes/);
        rating.votes = parseInt(parts[1].replace(/,/g, ''), 10);
      }

      if (ratingText.match(/Rating: [\d\.\/]+ \- [\d,]+ reviews/)) {
        parts = ratingText.match(/([\d,]+) reviews/);
        rating.reviews = parseInt(parts[1].replace(/,/g, ''), 10);
      }

      if (ratingText.match(/Rating: [\d\.\/]+ \- Review by .+/)) {
        parts = ratingText.match(/Review by ([^-]+)/);
        rating.reviewBy = parts[1];
      }

      row.Extensions.Rating = rating;
    }
  }
};

exports.extended = Parser;