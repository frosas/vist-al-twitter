var Twit = require('twit');
var Promise = require('bluebird');
var TwitterError = require('./twitter/error');

var promisify = function (object, func) {
    return Promise.promisify(object[func], object);
};

var Twitter = module.exports = function (params) {
    var twit = new Twit(params);
    this._post = promisify(twit, 'post');
};

Twitter.prototype.post = function () {
    return this._post.apply(null, arguments).catch(function (error) {
        throw new TwitterError(error);
    });
};

Twitter.prototype.retweet = function (tweetId) {
    return this.post('statuses/retweet/:id', {id: tweetId})
        .catch(function (error) {
            if (!error.isAlreadyRetweetedError()) throw error;
        });
};