// Gulp tasks

// Load plugins
var gulp = require('gulp'),
    less = require('gulp-less'),
    autoprefixer = require('autoprefixer'),
    postcss = require('gulp-postcss'),
    minifycss = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    gutil = require('gulp-util'),
    watch = require('gulp-watch'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    del = require('del'),
    uglify = require('gulp-uglify'),
    browserSync = require('browser-sync'),
    plumber = require('gulp-plumber'),
    processors = [
      autoprefixer({browsers: ['last 3 versions']})
    ];

var bowerDir = './bower_components';

gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: "./dist"
    }
  })
});

gulp.task('bs-reload', function() {
  browserSync.reload();
});

// bring in icon fonts
gulp.task('icons', function() { 
  return gulp.src(bowerDir + '/components-font-awesome/fonts/**.*') 
    .pipe(gulp.dest('dist/fonts')); 
});

// compile LESS to CSS
// run autoprefixer
// minify compiled CSS
gulp.task('styles', function() {
  return gulp.src('src/css/main.less')
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss(processors))
    .pipe(rename('main.css'))
    .pipe(gulp.dest('dist/css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss({advanced: false, keepSpecialComments: 0}))
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.reload({stream: true}));
});

// compile any third-party libraries into one JS file.
// includes jQuery by default
gulp.task('third-party', function() {
  return gulp.src(bowerDir + '/jquery/dist/jquery.js')
    .pipe(plumber())
    .pipe(concat('third-party.js'))
    .pipe(gulp.dest('dist/lib'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist/lib'))
    .pipe(browserSync.reload({stream: true}));
});

// concatenate and minify javascript
gulp.task('scripts', function() {
  return gulp.src('src/js/*.js')
    .pipe(plumber())
    .pipe(concat('main.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'))
    .pipe(browserSync.reload({stream: true}));
});

// copy HTML files
gulp.task('html', function() {
  return gulp.src('src/*.html')
    .pipe(plumber())
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.reload({stream: true}));
});

// compress and copy images
gulp.task('images', function () {
  return gulp.src('src/img/*')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    }))
    .pipe(gulp.dest('dist/img'))
    .pipe(browserSync.reload({stream: true}));
});

// clean up dist folder
gulp.task('clean', function(cb) {
  del(['dist/css', 'dist/js', 'dist/img', 'dist/lib'], cb)
});

// build task to populate the dist folder
gulp.task('build', ['clean'], function() {
  gulp.start('styles', 'scripts', 'third-party', 'html');
});

// watch task
gulp.task('watch', function() {
  gulp.watch('src/css/*.less', ['styles']);
  gulp.watch('src/css/main.css', ['bs-reload']);
  gulp.watch('src/*.html', ['html']);
  gulp.watch('src/img/*', ['images']);
  gulp.watch('src/js/*.js', ['scripts']);
})

// cleans dist, builds the files, starts a server, and watches files for changes
gulp.task('serve', ['clean', 'build', 'browser-sync', 'watch']);

// default task - calls serve
gulp.task('default', ['serve']);
