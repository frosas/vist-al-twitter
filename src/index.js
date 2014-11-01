var Promise = require('bluebird');
var phantom = require('./phantom');

Promise.longStackTraces();

var getTopicUrls = function () {
    return phantom.runOnPage('http://www.ara.cat/vistaltwitter', function () {
        return this.evaluate(function () {
            return [].map.call(document.querySelectorAll('.entry-title a'), function (a) {
                return a.href;
            });
        });
    });
};

var getTopicTweetsUrls = function (topicUrl) {
    return phantom.runOnPage(topicUrl, function () {
        return this.evaluate(function () {
            return [].map.call(document.querySelectorAll('#content a'), function (a) {
                    return a.href;
                })
                .filter(function (url) {
                    return url.match(/^https:\/\/twitter\.com\//);
                });
        });
    });
};

Promise.resolve(getTopicUrls())
    .map(getTopicTweetsUrls)
    .reduce(function (tweetsUrls, topicTweetsUrls) {
        return tweetsUrls.concat(topicTweetsUrls);
    }, [])
    .then(function (tweetsUrls) {
        console.log(tweetsUrls);
    })
    .done();