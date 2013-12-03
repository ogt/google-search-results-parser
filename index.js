exports.static = require('./lib/static').static;
exports.extended = require('./lib/extended').extended;

exports.parseFile = function (file, options) {
  if (!options) options = {};
  if (options.expanded_html === undefined) options.expanded_html = true;

  if (options.expanded_html) {
    return exports.extended.parseFile(file);
  } else {
    return exports.static.parseFile(file);
  }
};