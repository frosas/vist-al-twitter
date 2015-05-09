var Promise = require('bluebird');
var phridge = require('phridge');
var debug = require('debug')('phantom:pool');

var Pool = module.exports = function (max) {
    this._max = max;
    this._current = 0;
    this._queue = [];
    this._pool = [];
};

Pool.prototype.spawn = function (callback) {
    var pool = this;
    return new Promise(function(resolve, reject) {
        pool._queue.push({callback: callback, resolve: resolve, reject: reject});
        pool._spawnFromQueue();
    });
};

Pool.prototype.runOnPage = function(url, callback) {
    return this.spawn(function (phridgePhantom) {
        debug('Opening ' + url + '...');
        return phridgePhantom.openPage(url).then(function (phridgePage) {
            debug(url + ' opened');
            return phridgePage.run(callback);
        });
    });
};

Pool.prototype._spawnFromQueue = function () {
    var pool = this;
    if (this._queue.length) {
        if (this._current == this._max) return;
        var next = this._queue.shift();
        this._current++;
        this._getOrSpawnPhantom()
            .then(function(phridgePhantom) {
                return Promise.try(function() { return next.callback(phridgePhantom); })
                    .finally(function() { pool._pool.push(phridgePhantom); });
            })
            .finally(function() { pool._current--; pool._spawnFromQueue(); })
            .then(next.resolve, next.reject);
    } else {
        this._disposeAll();
    }
};

Pool.prototype._getOrSpawnPhantom = function() {
    return Promise.resolve(this._pool.shift() || this._spawnPhantom());
};

Pool.prototype._spawnPhantom = function () {
    debug('Spawning Phantom...');
    return phridge.spawn({autoLoadImages: false, diskCacheEnabled: true})
        .tap(function () { debug('Phantom spawn'); });
};

Pool.prototype._disposeAll = function() {
    while (this._pool.length) {
        debug("Disposing phantom...");
        this._pool.shift().dispose()
            .then(function() { debug("Phantom disposed"); })
            .done(); // TODO Any better option?
    }
};
