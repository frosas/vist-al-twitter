var Promise = require("bluebird");
var debug = require("debug")("browser/pool");
const puppeteer = require("puppeteer");

// These args are because https://github.com/GoogleChrome/puppeteer/issues/290
// TODO Is the browser closed automatically when the process exits?
const WHEN_BROWSER = puppeteer.launch({ args: ["--no-sandbox"] });

module.exports = class {
  constructor(max) {
    this._max = max;
    this._current = 0;
    this._queue = [];
    this._pool = [];
  }

  run(callback) {
    return new Promise((resolve, reject) => {
      this._queue.push({ callback, resolve, reject });
      this._runFromQueue();
    });
  }

  async runOnPage(url, callback) {
    return this.run(async page => {
      debug("Opening " + url + "...");
      await page.goto(url);
      debug("Running on page...");
      return page.evaluate(callback);
    });
  }

  _runFromQueue() {
    if (this._queue.length) {
      if (this._current == this._max) return;
      var next = this._queue.shift();
      this._current++;
      Promise.resolve(this._getOrCreatePage())
        .then(page => {
          return Promise.try(() => next.callback(page)).finally(() =>
            this._pool.push(page)
          );
        })
        .finally(() => {
          this._current--;
          this._runFromQueue();
        })
        .then(next.resolve, next.reject);
    } else {
      this._disposeAll();
    }
  }

  async _getOrCreatePage() {
    return this._pool.shift() || this._createPage();
  }

  async _createPage() {
    debug("Creating browser page...");
    return (await WHEN_BROWSER).newPage();
  }

  _disposeAll() {
    while (this._pool.length) {
      debug("Disposing browser page...");
      this._pool.shift().close(); // TODO Handle rejections
    }
  }
};
