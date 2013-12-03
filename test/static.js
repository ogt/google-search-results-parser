/* global it */
/* global describe */

var assert = require("assert");
var parser = require("../index");

describe('parser.static', function() {
  this.timeout(15000);

  it('should parse query_string', function() {
    var res = parser.static.parseFile('./test/data/example.html');
    assert.equal(res.query_string, 'racoon');
  });

  it('should parse serach results', function() {
    var res = parser.static.parseFile('./test/data/moto-g.html');
    assert.equal(res.results.length, 10);

    var first = res.results[0];
    assert.equal(first.Title, 'Moto G by Motorola - A Google Company');
    assert.equal(first.Type, 'plain');
    assert.equal(first.DisplayURL, 'www.motorola.com/us/consumers/moto-g/Moto-G/moto-g-pdp.html');
    assert.equal(first.Domain, 'www.motorola.com');
    assert.equal(first.CachedUrl.length > 1, true);
    assert.equal(first.URL, '/url?q=http://www.motorola.com/us/consumers/moto-g/Moto-G/moto-g-pdp.html&sa=U&ei=s7CWUo-oLseprAfNqoHoDg&ved=0CCAQFjAA&usg=AFQjCNF1GL1cZ3B_Q6UDYcQeDNkZb46TyQ');
    assert.equal(first.DirectUrl, 'http://www.motorola.com/us/consumers/moto-g/Moto-G/moto-g-pdp.html');
    assert.equal(!!first.Text.match(/Moto G is an exceptional phone at an exceptional price/), true);

    var second = res.results[1];
    assert.equal(second.Type, 'news');
  });

  it('should parse other file', function () {
    var res = parser.static.parseFile('./test/data/mentalist.html');

    [0, 1, 3, 4, 7].forEach(function(i) {
      assert.equal(res.results[i].Type, 'video');
      assert.equal(res.results[i].Text.length > 1, true);
      assert.equal(res.results[i].Domain.length > 1, true);
    });
  });

  it('should test parsing images', function() {
    var res = parser.static.parseFile('./test/data/example.html');

    var second = res.results[1];
    assert.equal(second.Title, 'Images for racoon');
    assert.equal(second.Type, 'images');
  });

  it('should parse sub links', function() {
    var res = parser.static.parseFile('./test/data/odesk.html');

    var first = res.results[0];
    assert.equal(first.Extensions.SiteLinks.length, 6);
    assert.equal(first.Extensions.SiteLinks[0].Title, 'Log In');
    assert.equal(first.Extensions.SiteLinks[0].URL.length > 1, true);
    assert.equal(first.Extensions.SiteLinks[0].Text, "Log in and get to work. Remember me \nnext time. Forgot password? oDesk.");
    assert.equal(first.Extensions.SiteLinks[0].DirectURL, 'https://www.odesk.com/login');
  });

  it('should parse rating', function() {
    var res = parser.static.parseFile('./test/data/moto-g.html');
    var row = res.results[2];
    assert.equal(row.Extensions.Rating.stars, 5);
    assert.equal(row.Extensions.Rating.score, 10);
    assert.equal(row.Extensions.Rating.scoreOf, 10);
    assert.equal(row.Extensions.Rating.votes, 2);

    var row2 = res.results[9];
    assert.equal(row2.Extensions.Rating.stars, 5);
    assert.equal(row2.Extensions.Rating.score, 10);
    assert.equal(row2.Extensions.Rating.scoreOf, 10);
    assert.equal(row2.Extensions.Rating.reviewBy, 'Andrew Williams');
  });

});