'use strict';
const gulp = require('gulp');
const scss = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const rename = require('gulp-rename');
const reload = browserSync.reload;

gulp.task('scss', function () {
  return gulp.src('./scss/**/*.scss')
    .pipe(scss().on('error', scss.logError))
    .pipe(autoprefixer({
            browsers: ['last 15 versions'],
            cascade: false
        }))
    .pipe(gulp.dest('./css'))
    .pipe(browserSync.stream());
});

gulp.task('browser-sync', ['scss'], function() { //',js'
    browserSync.init({
        proxy: "localhost:3000",  // local node app address
        port: 5000,  // use *different* port than above
        notify: true
    });
});

gulp.task('reload', () => {
  browserSync.reload()
})

gulp.task('watch', function () {
  gulp.watch('./scss/**/*.scss', ['scss']);
  gulp.watch('./html/**/*.html').on('change', reload);
});

gulp.task('default', ['watch','browser-sync']);