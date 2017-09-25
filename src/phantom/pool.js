var Promise = require("bluebird");
var phridge = require("phridge");
var debug = require("debug")("phantom:pool");

module.exports = class {
  constructor(max) {
    this._max = max;
    this._current = 0;
    this._queue = [];
    this._pool = [];
  }

  spawn(callback) {
    return new Promise((resolve, reject) => {
      this._queue.push({
        callback: callback,
        resolve: resolve,
        reject: reject
      });
      this._spawnFromQueue();
    });
  }

  runOnPage(url, callback) {
    return this.spawn(phridgePhantom => {
      debug("Opening " + url + "...");
      return phridgePhantom.openPage(url).then(phridgePage => {
        debug("Running on page...");
        return phridgePage.run(callback);
      });
    });
  }

  _spawnFromQueue() {
    if (this._queue.length) {
      if (this._current == this._max) return;
      var next = this._queue.shift();
      this._current++;
      this._getOrSpawnPhantom()
        .then(phridgePhantom => {
          return Promise.try(() => next.callback(phridgePhantom)).finally(() =>
            this._pool.push(phridgePhantom)
          );
        })
        .finally(() => {
          this._current--;
          this._spawnFromQueue();
        })
        .then(next.resolve, next.reject);
    } else {
      this._disposeAll();
    }
  }

  _getOrSpawnPhantom() {
    return Promise.resolve(this._pool.shift() || this._spawnPhantom());
  }

  _spawnPhantom() {
    debug("Spawning Phantom...");
    return phridge.spawn({ autoLoadImages: false, diskCacheEnabled: true });
  }

  _disposeAll() {
    while (this._pool.length) {
      debug("Disposing phantom...");
      this._pool.shift().dispose(); // TODO Handle rejections
    }
  }
};
