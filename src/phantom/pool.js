var Promise = require('bluebird');
var phridge = require('phridge');

var Pool = module.exports = function (max) {
    this._max = max;
    this._current = 0;
    this._queue = [];
    this._pool = [];
};

Pool.prototype.spawn = function (callback) {
    var pool = this;
    return new Promise(function(resolve, reject) { // TODO Does it handle exceptions?
        pool._queue.push({
            callback: callback,
            resolve: resolve,
            reject: reject
        });
        pool._spawnFromQueue();
    });
};

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
    if (this._queue.length) {
        if (this._current == this._max) return;
        var next = this._queue.shift();
        this._current++;
        this._getOrSpawnPhantom()
            .tap(function(phridgePhantom) {
                return Promise.try(function() { return next.callback(phridgePhantom); })
                    .then(next.resolve, next.reject);
            })
            .then(function(phridgePhantom) {
                pool._pool.push(phridgePhantom);
            })
            .finally(function() {
                pool._current--;
                pool._spawnFromQueue();
            })
            .done(); // TODO Any better option?
    } else {
        this._dispose();
    }
};

Pool.prototype._getOrSpawnPhantom = function() {
    return Promise.resolve(this._pool.shift() || this._spawnPhantom());
};

Pool.prototype._spawnPhantom = function () {
    console.log('Spawning Phantom...');
    return phridge.spawn({autoLoadImages: false, diskCacheEnabled: true})
        .tap(function (phridgePhantom) { console.log('Phantom spawn'); });
};

Pool.prototype._dispose = function() {
    while (this._pool.length) {
        console.log("Disposing phantom...");
        this._pool.shift().dispose()
            .then(function() { console.log("Phantom disposed"); })
            .done(); // TODO Any better option?
    }
};
