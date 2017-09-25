var gulp = require("gulp");
var mocha = require("gulp-mocha");

gulp.task("default", function() {
  return require("./src/index").catch(function(error) {
    console.error(error.stack); // eslint-disable-line no-console
    // For some reason the process keeps running here. Finish it explicitely.
    // TODO Figure out what's preventing it
    process.exit(1); // eslint-disable-line no-process-exit
  });
});

gulp.task("test", function(done) {
  gulp.src("src/**/*.js").on("finish", function() {
    gulp
      .src(["tests/**/*.js"])
      .pipe(mocha())
      .on("end", done);
  });
});
