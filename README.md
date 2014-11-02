### Usage

```bash
$ npm install
$ export VIST_AL_TWITTER_CONSUMER_KEY="..."
$ export VIST_AL_TWITTER_CONSUMER_SECRET="..."
$ export VIST_AL_TWITTER_ACCESS_TOKEN="..."
$ export VIST_AL_TWITTER_ACCESS_TOKEN_SECRET="..."
$ npm start
```

### Testing

```bash
$ npm test
```

### TODO

- Hide browser JS errors by default
- Retweet tweets
- Deploy to production
- Log (and control) messages through a logger
- Test, test, test!
- Only log errors when extracting tweets from a topic page fails
- Fix "possible EventEmitter memory leak detected. 11 listeners added. Use emitter.setMaxListeners() 
  to increase limit." warning
- Fix PhantomJS processes not ever finishing