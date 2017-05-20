// Grab our gulp packages
var gulp         = require('gulp'),
    gutil        = require('gulp-util'),
    sass         = require('gulp-sass'),
    cssnano      = require('gulp-cssnano'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps   = require('gulp-sourcemaps'),
    jshint       = require('gulp-jshint'),
    stylish      = require('jshint-stylish'),
    uglify       = require('gulp-uglify'),
    concat       = require('gulp-concat'),
    rename       = require('gulp-rename'),
    plumber      = require('gulp-plumber'),
    bower        = require('gulp-bower'),
    babel        = require('gulp-babel'),
    ftp          = require('vinyl-ftp');

// Define FTP connection info
// Tip: create a separate variable for a staging environment for easy switching
const conn = ftp.create({
  host: "ftp.hostname.com",
  user: "usernamehere",
  pass: "passwordhere",
  parallel: 10
});

// Set the base remote path
const remoteBase = '/public_html';

// Define the theme name you're using
const themeName = 'theme-name';

// Define the theme path based on the the remoteBase and themeName variables
const themePath = `${remoteBase}/wp-content/themes/${themeName}`;

// Update the paths below based on your theme's directory structure
// Note: for the remote paths, just change the part after ${themePath}
const PATHS = {
  local: {
    css   : './assets/css/',
    js    : './assets/js/',
    images: './assets/images/',
    svg   : './assets/images/'
  },
  remote: {
    css   : `${themePath}/assets/css/`,
    js    : `${themePath}/assets/js/`,
    images: `${themePath}/assets/images/`,
    svg   : `${themePath}/assets/images/`
  }
};

// Compile Sass, Autoprefix and minify
gulp.task('styles', () => {
    return gulp.src('./assets/scss/**/*.scss')
        .pipe(plumber(function(error) {
            gutil.log(gutil.colors.red(error.message));
            this.emit('end');
        }))
        .pipe(sourcemaps.init()) // Start Sourcemaps
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest(PATHS.local.css))
        .pipe(conn.dest(PATHS.remote.css))
        .pipe(rename({suffix: '.min'}))
        .pipe(cssnano())
        .pipe(sourcemaps.write('.')) // Creates sourcemaps for minified styles
        .pipe(gulp.dest(PATHS.local.css))
        .pipe(conn.dest(PATHS.remote.css))
});
    
// JSHint, concat, and minify JavaScript
// Includes support for ES2015 syntax
gulp.task('site-js', () => {
  return gulp.src('./assets/js/scripts/**/*.js')
    .pipe(plumber())
    .pipe(babel({
      presets: ['es2015'],
        compact: true
    }))
    .pipe(sourcemaps.init())
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(concat('scripts.js'))
    .pipe(gulp.dest(PATHS.local.js))
    .pipe(conn.dest(PATHS.remote.js))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(sourcemaps.write('.')) // Creates sourcemap for minified JS
    .pipe(gulp.dest(PATHS.local.js))
    .pipe(conn.dest(PATHS.remote.js))
});    

// JSHint, concat, and minify Foundation JavaScript
gulp.task('foundation-js', () => {
  return gulp.src([ 
        
    // Foundation core - needed if you want to use any of the components below
    './vendor/foundation-sites/js/foundation.core.js',
    './vendor/foundation-sites/js/foundation.util.*.js',
    
    // Pick the components you need in your project
    './vendor/foundation-sites/js/foundation.abide.js',
    './vendor/foundation-sites/js/foundation.accordion.js',
    './vendor/foundation-sites/js/foundation.accordionMenu.js',
    './vendor/foundation-sites/js/foundation.drilldown.js',
    './vendor/foundation-sites/js/foundation.dropdown.js',
    './vendor/foundation-sites/js/foundation.dropdownMenu.js',
    './vendor/foundation-sites/js/foundation.equalizer.js',
    './vendor/foundation-sites/js/foundation.interchange.js',
    './vendor/foundation-sites/js/foundation.magellan.js',
    './vendor/foundation-sites/js/foundation.offcanvas.js',
    './vendor/foundation-sites/js/foundation.orbit.js',
    './vendor/foundation-sites/js/foundation.responsiveMenu.js',
    './vendor/foundation-sites/js/foundation.responsiveToggle.js',
    './vendor/foundation-sites/js/foundation.reveal.js',
    './vendor/foundation-sites/js/foundation.slider.js',
    './vendor/foundation-sites/js/foundation.sticky.js',
    './vendor/foundation-sites/js/foundation.tabs.js',
    './vendor/foundation-sites/js/foundation.toggler.js',
    './vendor/foundation-sites/js/foundation.tooltip.js',
  ])
  .pipe(babel({
    presets: ['es2015'],
      compact: true
  }))
  .pipe(sourcemaps.init())
  .pipe(concat('foundation.js'))
  .pipe(gulp.dest(PATHS.local.js))
  .pipe(conn.dest(PATHS.remote.js))
  .pipe(rename({suffix: '.min'}))
  .pipe(uglify())
  .pipe(sourcemaps.write('.')) // Creates sourcemap for minified Foundation JS
  .pipe(gulp.dest(PATHS.local.js))
  .pipe(conn.dest(PATHS.remote.js))
}); 

// ROD: Update Foundation with Bower and save to /vendor
gulp.task('bower', () => {
  return bower({ cmd: 'update'})
    .pipe(gulp.dest('./vendor/'))
});  


// Watch files for changes (without Browser-Sync)
gulp.task('watch', () => {

  // Watch .scss files
  gulp.watch('assets/scss/**/*.scss', ['styles']);

  // Watch site-js files
  gulp.watch('assets/js/scripts/*.js', ['site-js']);
  
  // Watch foundation-js files
  gulp.watch('vendor/foundation-sites/js/*.js', ['foundation-js']);

}); 

// Run styles, site-js and foundation-js
gulp.task('default', () => {
  gulp.start('styles', 'site-js', 'foundation-js', 'watch');
});
