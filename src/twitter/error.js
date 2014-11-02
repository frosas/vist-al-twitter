var TwitterError = module.exports = function (twitError) {
    this._twitError = twitError;
    this.message = twitError.message || twitError.cause.allErrors;
};

TwitterError.prototype = Object.create(Error.prototype);

TwitterError.prototype.isAlreadyRetweetedError = function () {
    return this._twitError.cause.allErrors.match('sharing is not permissible for this status');    
};