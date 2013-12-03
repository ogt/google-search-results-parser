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
  // TODO
});
