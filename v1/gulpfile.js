// Imports
const del = require('del');
const gulp = require('gulp');
const babel = require('gulp-babel');
const sm = require('gulp-sourcemaps');
const terser = require('gulp-terser');

// Paths
const paths = {
  src: ['src/**/*.ts', '!src/**/__tests__/**/*.ts', '!src/testSetup.ts'],
  dist: 'dist',
};

// Tasks
// build: Builds and minifies the project
const build = () => {
  // Take source files
  return gulp
    .src(paths.src)
    .pipe(sm.init()) // Initialize source maps
    .pipe(babel()) // Transpile using babel
    .pipe(terser()) // Minify using terser
    .pipe(sm.write('.')) // Write source maps
    .pipe(gulp.dest(paths.dist)); // Emit to output directory;
};

// clean: Removes previous build files
const clean = () => {
  return del([paths.dist]);
};

// Exports
module.exports = {
  clean,
  default: gulp.series(clean, build),
};
