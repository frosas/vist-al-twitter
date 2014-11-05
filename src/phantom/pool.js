var phantom = require('../phantom');
var Promise = require('bluebird');

var Pool = module.exports = function (max) {
    this._max = max;
    this._current = 0;
    this._queue = [];
};

Pool.prototype.spawn = function (callback) {
    var pool = this;
    return new Promise(function(resolve, reject) {
        pool._queue.push({
            callback: callback,
            resolve: resolve,
            reject: reject
        });
        pool._spawnFromQueue();
    });
};

// TODO DRY (see phantom.runOnPage())
Pool.prototype.runOnPage = function(url, callback) {
    return this.spawn(function (phridgePhantom) {
        console.log('Opening ' + url + '...');
        return phridgePhantom.openPage(url).then(function (phridgePage) {
            console.log(url + ' opened');
            return phridgePage.run(callback);
        });
    });
};

Pool.prototype._spawnFromQueue = function () {
    var pool = this;
    if (!this._queue.length || this._max == this._current) return;
    var next = this._queue.shift();
    this._current++;
    return phantom.spawn(next.callback)
        .finally(function() { 
            pool._current--;
            pool._spawnFromQueue(); 
        })
        .then(next.resolve, next.reject);
};
