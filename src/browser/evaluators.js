/* global document Set */

exports.getTopicUrlsEvaluator = () => {
  return Array.from(
    new Set(
      Array.from(document.querySelectorAll("a[href]"))
        .map(a => a.href.match(/([^#]*)/) && RegExp.$1)
        .filter(url => url.match(/:\/\/[^/]+\/vistaltwitter\/.+/))
    )
  );
};

exports.getTopicTweetsEvaluator = () => {
  return Array.from(document.querySelectorAll("#content a[href]")).map(
    a => a.href
  );
};
