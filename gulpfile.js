var gulp = require("gulp");

gulp.task("default", function() {
  return require("./src/index").catch(function(error) {
    console.error(error.stack); // eslint-disable-line no-console
    // For some reason the process keeps running here. Finish it explicitely.
    // TODO Figure out what's preventing it
    process.exit(1); // eslint-disable-line no-process-exit
  });
});
