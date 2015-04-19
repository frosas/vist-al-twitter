var ERROR_ALREADY_RETWEETED = 327;

var TwitterError = module.exports = function (twitError) {
    this._twitError = twitError;
    this.message = this._getMessage();
};

TwitterError.prototype = Object.create(Error.prototype);

TwitterError.prototype.isAlreadyRetweetedError = function () {
    return this._twitError.allErrors.some(function (error) {
        return error.code == ERROR_ALREADY_RETWEETED;
    });
};

TwitterError.prototype._getMessage = function () {
    return this._twitError.message || this._getErrorsMessage() || 'Unknown error';
};

TwitterError.prototype._getErrorsMessage = function () {
    return this._twitError.allErrors.
        map(function (error) { return error.message; }).
        join(', ');
};