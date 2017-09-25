var Promise = require("bluebird");
var Twitter = require("./twitter");
var misc = require("./misc");
var Bacon = require("baconjs");
var PhantomPool = require("./phantom/pool");
var debug = require("debug")("app");

var getTopicUrls = () => {
  debug("Obtaining topic URLs...");
  return phantomPool
    .runOnPage("http://www.ara.cat/vistaltwitter", function() {
      return this.evaluate(function() {
        /* global document */ // TODO Move function to src/browser-functions.js
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
    })
    .then(urls => {
      debug(`Topic URLs obtained: ${urls.join(", ")}`);
      return urls;
    });
};

var getTopicTweets = topicUrl => {
  return Promise.resolve()
    .then(() => {
      return phantomPool.runOnPage(topicUrl, function() {
        return this.evaluate(function() {
          return [].slice
            .call(document.querySelectorAll("#content a[href]"))
            .map(function(a) {
              return a.href;
            });
        });
      });
    })
    .map(url => {
      const id = misc.getTweetIdFromUrl(url);
      return id && { id, url };
    })
    .filter(tweetOrNull => tweetOrNull);
};

var getTweets = function() {
  return Bacon.fromBinder(function(sink) {
    Promise.resolve()
      .then(getTopicUrls)
      .map(function(url) {
        return Promise.resolve(getTopicTweets(url)).map(sink);
      })
      .catch(function(error) {
        sink(new Bacon.Error(error));
      })
      .finally(function() {
        sink(new Bacon.End());
      });
  });
};

/**
 * @returns [Bacon.EventStream(Object)] The retweeted tweets
 */
var retweetAll = function() {
  return getTweets().flatMap(function(tweet) {
    return Bacon.fromPromise(twitter.retweet(tweet.id)).flatMap(function(
      retweeted
    ) {
      return retweeted ? tweet : Bacon.never();
    });
  });
};

Promise.longStackTraces();

var phantomPool = new PhantomPool(4);

var twitter = new Twitter({
  consumer_key: process.env.VIST_AL_TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.VIST_AL_TWITTER_CONSUMER_SECRET,
  access_token: process.env.VIST_AL_TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.VIST_AL_TWITTER_ACCESS_TOKEN_SECRET
});

const retweets = retweetAll();
retweets.onValue(tweet => debug(tweet.url + " retweeted"));
retweets.onError(error => console.error(error)); // eslint-disable-line no-console
retweets
  .errors()
  .last()
  .onError(() => process.exit(1));
