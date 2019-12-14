// Imports
const del = require("del");
const gulp = require("gulp");
const babel = require("gulp-babel");
const terser = require("gulp-terser");

// Paths
const paths = {
    src: [
        "src/**/*.ts",
        "!src/testSetup.ts",
        "!src/koaTestAgent.ts",
        "!src/**/__tests__/**/*.ts",
    ],
    dest: "dist",
};

// Tasks
const build = () => {
    return gulp
        .src(paths.src)
        .pipe(babel())
        .pipe(terser())
        .pipe(gulp.dest(paths.dest));
};

const clean = () => {
    return del(paths.dest);
};

// Exports
module.exports = {
    build,
    clean,
    default: gulp.series(clean, build),
};
