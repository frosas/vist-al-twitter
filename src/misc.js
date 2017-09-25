/**
 * @param {String} url
 * @returns {String|falsy} The tweet ID or falsy if it's not a tweet URL
 */
exports.getTweetIdFromUrl = function(url) {
  var matches = url.match(/^https?:\/\/twitter\.com\/[^/]+\/status\/([0-9]+)/);
  return matches && matches[1];
};
