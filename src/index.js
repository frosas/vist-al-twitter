var Promise = require("bluebird");
var Twitter = require("./twitter");
var misc = require("./misc");
var Bacon = require("baconjs");
const BrowserPool = require("./browser/pool");
var debug = require("debug")("app");
const browserEvaluators = require("./browser-evaluators");

var getTopicUrls = () => {
  debug("Obtaining topic URLs...");
  return browserPool
    .runOnPage(
      "https://www.ara.cat/vistaltwitter",
      browserEvaluators.getTopicUrlsEvaluator
    )
    .then(urls => {
      debug(`Topic URLs obtained: ${urls.join(", ")}`);
      return urls;
    });
};

var getTopicTweets = topicUrl => {
  return Promise.resolve()
    .then(() => {
      return browserPool.runOnPage(
        topicUrl,
        browserEvaluators.getTopicTweetsEvaluator
      );
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

var browserPool = new BrowserPool(4);

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
