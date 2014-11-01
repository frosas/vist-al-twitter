var phridge = require('phridge');
var Promise = require('bluebird');

var phantom = module.exports = {};

/**
 * @return {Promise}
 */
phantom.spawn = function (callback) {
    console.log('Spawning Phantom...');
    return phridge.spawn({loadImages: false}).then(function (phridgePhantom) {
        console.log('Phantom spawn');
        return Promise
            .try(function () { return callback(phridgePhantom); })
            .finally(function () { phridgePhantom.dispose(); });
    });
};

/**
 * @return {Promise}
 */
phantom.runOnPage = function (url, callback) {
    return this.spawn(function (phridgePhantom) {
        console.log('Opening ' + url + '...');
        return phridgePhantom.openPage(url).then(function (phridgePage) {
            console.log(url + ' opened');
            return phridgePage.run(callback);
        });
    });
};

/**
 * @return {Promise}
 */
phantom.evaluateOnPage = function (url, callback) {
    return this.runOnPage(url, function () {
        return this.evaluate(callback);
    });
};