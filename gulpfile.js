var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var sass        = require('gulp-sass');
var pug         = require('gulp-pug');

// Static Server + watching scss/html files
gulp.task('serve', ['sass', 'views'], function() {

    browserSync.init({
        server: "./app"
    });

    gulp.watch("app/__source/styles/scss/*.scss", ['sass']);
    gulp.watch("app/*.html").on('change', browserSync.reload);
});

// Compile PUG into HTML
gulp.task('views', function buildHTML() {
  return gulp.src('app/__source/views/templates/*.pug')
  .pipe(pug())
  .pipe(gulp.dest("app/"))
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
    return gulp.src("app/__source/styles/scss/main.scss")
        .pipe(sass())
        .pipe(gulp.dest("app/css/main.css"))
        .pipe(browserSync.stream());
});

gulp.task('default', ['views', 'sass', 'serve']);