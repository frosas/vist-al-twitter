var misc = require("../../src/misc");
var assert = require("assert");

describe("misc", function() {
  describe("getTweetIdFromUrl()", function() {
    it("returns the tweet ID", function() {
      var id = misc.getTweetIdFromUrl(
        "https://twitter.com/DBR8/status/528650973590597632"
      );
      assert.equal(id, "528650973590597632");
    });

    it("works with http:// URLs", function() {
      var id = misc.getTweetIdFromUrl(
        "http://twitter.com/DBR8/status/528650973590597632"
      );
      assert.equal(id, "528650973590597632");
    });

    it("returns falsy with non-tweet URLs", function() {
      assert(!misc.getTweetIdFromUrl("http://example.com"));
    });
  });
});
