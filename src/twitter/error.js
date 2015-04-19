var TwitterError = module.exports = function (twitError) {
    this._twitError = twitError;
    this.message = this._getMessage();
};

TwitterError.prototype = Object.create(Error.prototype);

TwitterError.prototype.isAlreadyRetweetedError = function () {
    return this._getErrors().some(function (error) {
        return error.match('You have already retweeted this tweet');
    });
};

TwitterError.prototype._getErrors = function () {
    var errors = this._twitError.allErrors;
    return typeof errors == 'string' ? [errors] :
        errors.map(function (error) { return error.message; });
};

TwitterError.prototype._getMessage = function () {
    return this._twitError.message || this._getErrors().join(', ') || 'Unknown error';
};