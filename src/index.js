var Promise = require('bluebird');
var phantom = require('./phantom');
var Twit = require('twit');
var misc = require('./misc');

Promise.longStackTraces();

var promisify = function (object, func) {
    return Promise.promisify(object[func], object);
};

var getTopicUrls = function () {
    return phantom.runOnPage('http://www.ara.cat/vistaltwitter', function () {
        return this.evaluate(function () {
            return [].map.call(document.querySelectorAll('.entry-title a'), function (a) {
                return a.href;
            });
        });
    });
};

var getTopicTweets = function (topicUrl) {
    return Promise.resolve(phantom.runOnPage(topicUrl, function () {
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

var twit = new Twit({
    consumer_key: process.env.VIST_AL_TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.VIST_AL_TWITTER_CONSUMER_SECRET,
    access_token: process.env.VIST_AL_TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.VIST_AL_TWITTER_ACCESS_TOKEN_SECRET
});

Promise.resolve(getTopicUrls())
    .map(function (topicUrl) {
        return Promise.resolve(getTopicTweets(topicUrl)).map(function (tweet) {
            console.log('Retweeting ' + tweet.url + '...');
            return promisify(twit, 'post')('statuses/retweet/:id', {id: tweet.id});
        });
    })
    .done();