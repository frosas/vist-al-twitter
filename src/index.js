var Promise = require('bluebird');
var Twitter = require('./twitter');
var misc = require('./misc');
var Bacon = require('baconjs');
var PhantomPool = require('./phantom/pool');
var debug = require('debug')('app');

var getTopicUrls = function () {
    return phantomPool.runOnPage('http://www.ara.cat/vistaltwitter', function () {
        return this.evaluate(function () {
            return [].map.call(document.querySelectorAll('.entry-title a'), function (a) {
                return a.href;
            });
        });
    });
};

var getTopicTweets = function (topicUrl) {
    return Promise.resolve(phantomPool.runOnPage(topicUrl, function () {
            return this.evaluate(function () {
                return [].map.call(document.querySelectorAll('#content a'), function (a) {
                    return a.href || '';
                });
            });
        }))
        .map(function (url) {
            var tweetId = misc.getTweetIdFromUrl(url);
            return tweetId && {id: tweetId, url: url};
        })
        .filter(function (tweetOrNull) { return tweetOrNull; });
};

var getTweets = function () {
    return Bacon.fromBinder(function (sink) {
        Promise.resolve(getTopicUrls())
            .map(function (url) { return Promise.resolve(getTopicTweets(url)).map(sink); })
            .catch(function (error) { sink(new Bacon.Error(error)); })
            .finally(function () { sink(new Bacon.End()); })
            .done(); // TODO Are errors caught by Bacon?
    });
};

/**
 * @returns [Bacon.EventStream(Object)] The retweeted tweets
 */
var retweetAll = function () {
    return getTweets().flatMap(function (tweet) {
        return Bacon.fromPromise(twitter.retweet(tweet.id)).flatMap(function (retweeted) {
            return retweeted ? tweet : Bacon.never();
        });
    });
};

Promise.longStackTraces();

var phantomPool = new PhantomPool(2);

var twitter = new Twitter({
    consumer_key: process.env.VIST_AL_TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.VIST_AL_TWITTER_CONSUMER_SECRET,
    access_token: process.env.VIST_AL_TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.VIST_AL_TWITTER_ACCESS_TOKEN_SECRET
});

module.exports = new Promise(function (resolve, reject) {
    // TODO Does Bluebird catch thrown exceptions here?
    var retweets = retweetAll();
    retweets.onValue(function (tweet) { debug(tweet.url + ' retweeted'); });
    retweets.onError(function (error) { throw error; }); // TODO This is not finalizing the process right?
    retweets.onEnd(resolve);
});
