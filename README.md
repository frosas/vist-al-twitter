### Usage

```bash
$ npm install
$ export VIST_AL_TWITTER_CONSUMER_KEY="..."
$ export VIST_AL_TWITTER_CONSUMER_SECRET="..."
$ export VIST_AL_TWITTER_ACCESS_TOKEN="..."
$ export VIST_AL_TWITTER_ACCESS_TOKEN_SECRET="..."
$ gulp
```

### Testing

```bash
$ gulp test
```

### TODO

- Hide browser JS errors by default
- ~~Retweet tweets~~
- Cron it
- Log (and control) messages through a logger
- Test, test, test!
- Only log errors when extracting tweets from a topic page fails
- Fix "possible EventEmitter memory leak detected. 11 listeners added. Use emitter.setMaxListeners() 
  to increase limit." warning
- Fix PhantomJS processes not ever finishing

  > I strongly recommend to call phridge.disposeAll() when the node process exits as this is the only way to ensure that all child processes terminate as well. Since disposeAll() is async it is not safe to call it on process.on("exit"). It is better to call it on SIGINT, SIGTERM and within your regular exit flow.
- Run a limited amount of Phantom processes?