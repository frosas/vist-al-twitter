/* global document */

exports.getTopicUrlsEvaluator = function() {
  return this.evaluate(function() {
    return Object.keys(
      [].slice
        .call(document.querySelectorAll("a[href]"))
        .map(function(a) {
          return a.href.match(/([^#]*)/) && RegExp.$1;
        })
        .filter(function(url) {
          return url.match(/:\/\/[^/]+\/vistaltwitter\/.+/);
        })
        .reduce(function(set, url) {
          set[url] = null;
          return set;
        }, {})
    );
  });
};

exports.getTopicTweetsEvaluator = function() {
  return this.evaluate(function() {
    return [].slice
      .call(document.querySelectorAll("#content a[href]"))
      .map(function(a) {
        return a.href;
      });
  });
};
