var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');

gulp.task('default', function() {
    return require('./src/index').catch(function (error) {
        console.error(error.stack);        
        // For some reason the process keeps running here. Finish it explicitely.
        process.exit(1); // eslint-disable-line no-process-exit
    });
});

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
