/* global it */
/* global describe */

var assert = require("assert");
var parser = require("../index");

describe('parser.extended', function () {
  this.timeout(15000);

  it('should parse file searchable', function() {
    var res = parser.extended.parseFile('test/rich_data/1.html');
    assert.equal(res.query_string, 'indonesia flight ticket');
  });

  it('should parse results', function() {
    var res = parser.extended.parseFile('test/rich_data/1.html');
    assert.equal(res.results.length, 10);

    var first = res.results[0];
    assert.equal(first.Title, 'TIKET2 INDONESIA. Find cheap Indonesian flights and book plane ...');
    assert.equal(first.Text, 'Cheap promo flights in Indonesia! TIKET2 compares plane tickets prices ' +
      'from ALL major Indonesian airlines. No middlemen! Book your ticket directly and save ...');
    assert.equal(first.DisplayURL, 'www.tiket2.com/');
    assert.equal(first.Type, 'plain');
    assert.equal(first.DirectUrl, 'http://www.tiket2.com/');
    assert.equal(first.Domain, 'www.tiket2.com');

    assert.equal(first.Extensions.SiteLinks.length, 4);
    assert.equal(first.Extensions.SiteLinks[0].Title, 'Promo');
    assert.equal(first.Extensions.SiteLinks[0].URL, 'http://www.tiket2.com/english/promo-flights-tracker.html');
    assert.equal(first.Extensions.SiteLinks[0].DirectURL, 'http://www.tiket2.com/english/promo-flights-tracker.html');

    var seventh = res.results[6];
    assert.equal(seventh.Title, 'Indonesia Flight - Android Apps on Google Play');
    assert.equal(seventh.Text, 'Indonesia Flight Beta Apps is an online flight ticket ' +
      'reservation with various airlines in one system. Customer can search flights, ' + 
      'compare the fares, book the flight ...');
    assert.equal(seventh.DisplayURL, 'https://play.google.com/store/apps/details?id=indonesia.flight&hl=en');
    assert.equal(seventh.Type, 'plain');
    assert.equal(seventh.DirectUrl, 'https://play.google.com/store/apps/details?id=indonesia.flight&hl=en');
    assert.equal(seventh.Domain, 'play.google.com');

    assert.equal(seventh.Extensions.Rating.stars, 59 / 65 * 5);
    assert.equal(seventh.Extensions.Rating.score, 4.5);
    assert.equal(seventh.Extensions.Rating.votes, 7062);
  });

  it('should parse rating correctly', function() {
    res = parser.extended.parseFile('test/rich_data/3.html');

    var second = res.results[1];
    assert.equal(second.Extensions.Rating.stars, 59 / 65 * 5);
    assert.equal(second.Extensions.Rating.score, 4.5);
    assert.equal(second.Extensions.Rating.reviews, 858);

    var fourth = res.results[3];
    assert.equal(fourth.Extensions.Rating.stars, 59 / 65 * 5);
    assert.equal(fourth.Extensions.Rating.score, 8.9);

    res = parser.extended.parseFile('test/rich_data/7.html');

    var sixth = res.results[5];
    assert.equal(sixth.Extensions.Rating.stars, 5);
    assert.equal(sixth.Extensions.Rating.score, 10);
    assert.equal(sixth.Extensions.Rating.scoreOf, 10);
    assert.equal(sixth.Extensions.Rating.reviewBy, 'Andrew Williams');
  });

  it('should parse PublishedBy', function() {
    res = parser.extended.parseFile('test/rich_data/7.html');
    var third = res.results[2];

    assert.equal(third.Extensions.PublishedBy.Who, 'Alex Dobie');
    assert.equal(third.Extensions.PublishedBy.Date, '19 hours ago');
    assert.equal(third.Extensions.PublishedBy.Followers, 9144);
  });

  it('should parse type', function() {
    res = parser.extended.parseFile('test/rich_data/3.html');
    assert.equal(res.results[4].Type, 'images');

    res = parser.extended.parseFile('test/rich_data/7.html');
    assert.equal(res.results[1].Type, 'news');
    assert.equal(res.results[9].Type, 'video');
  });
});
