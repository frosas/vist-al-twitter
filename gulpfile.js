var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');

gulp.task('default', function() {
    return require('./src/index');
});

// See http://stackoverflow.com/a/24784196/337172
gulp.task('test', function(done) {
    gulp.src('src/**/*.js')
        .pipe(istanbul({includeUntested: true}))
        .on('finish', function() {
            gulp.src(['tests/**/*.js'])
                .pipe(mocha())
                .pipe(istanbul.writeReports())
                .on('end', done);
        });
});
