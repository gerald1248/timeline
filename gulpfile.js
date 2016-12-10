var gulp  = require('gulp'),
  util = require('gulp-util'),
  concat = require('gulp-concat'),
  zip = require('gulp-zip'),
  runSequence = require('run-sequence'),
  del = require('del'),
  argv = require('yargs').argv,
  exec = require('child_process').exec,
  sourcemaps = require('gulp-sourcemaps'),
  cleancss = require('gulp-clean-css'),
  htmlmin = require('gulp-htmlmin'),
  minify = require('gulp-minify'),
  os = require('os'),
  getos = require('getos');

var pkg = require('./package.json');
var platform = os.platform()
if (platform === "linux") {
  var obj = getos(function(e, os) {
    if (!e) {
      platform = os.dist + '-' + os.release;
      platform = platform.replace(/ /g, '_').toLowerCase();
    }
  });
}

gulp.task('default', ['build', 'watch']);

gulp.task('build', function(callback) {
  runSequence(
    'clean-bin',
    'fmt',
    'vet',
    'build-api',
    'build-js',
    'build-css',
    'build-html',
    'build-bindata',
    'build-go',
    'package-binary',
    'dist',
    'clean-home',
    'build-sample',
    'test',
    callback);
});

gulp.task('build-api', function() {
  return gulp.src(['./api/timeline-schema.json'])
    .pipe(minify().on('error', util.log))
    .pipe(gulp.dest('./static'))
});

gulp.task('build-js', function() {
  return gulp.src(['./src/js/main.js'])
    .pipe(sourcemaps.init())
    .pipe(concat('bundle.js'))
    .pipe(minify().on('error', util.log))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./static/js'));
});

gulp.task('build-css', function() {
  return gulp.src(['./src/css/main.css'])
    .pipe(sourcemaps.init())
    .pipe(cleancss())
    .pipe(gulp.dest('./static/css'))
});

gulp.task('build-html', function() {
  return gulp.src(['./src/index.html'])
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('./static'));
});

gulp.task('build-go', function(callback) {
  exec('go build', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    callback(err);
  });
});

gulp.task('copy-binary', function() {
  return gulp.src(['./timeline', './timeline.exe'])
    .pipe(gulp.dest('../../../../bin'))
});

gulp.task('package-binary', function() {
  return gulp.src(['./timeline', './timeline.exe'], { base: '.' })
    .pipe(gulp.dest('package'))
});

gulp.task('dist', function() {
  return gulp.src('./package/**/*', { base: './package' })
    .pipe(zip(pkg.name + '-' + pkg.version + '-' + platform + '.zip'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('build-sample', function(callback) {
  exec('./package/timeline data/*.json', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    callback(err);
  });
});

gulp.task('test', function(callback) {
  exec('go test', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    callback(err);
  });
});

gulp.task('fmt', function(callback) {
  //listing files so bindata.go is ignored
  exec('gofmt -d calendar.go routine.go server.go data.go theme.go draw.go timeline.go', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    callback(err);
  });
});

gulp.task('vet', function(callback) {
  exec('go vet', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    callback(err);
  });
});

gulp.task('clean-home', function() {
  return del.sync(['./timeline', './timeline.exe'], { force: true });
});

gulp.task('clean-bin', function() {
  return del.sync(['../../../../bin/timeline', './dist/' + pkg.name + '-*-' + platform + '.zip', './package/**/*'], { force: true });
});

gulp.task('build-bindata', function(callback) {
  exec('go-bindata static/...', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    callback(err);
  });
});

gulp.task('watch', function() {
  gulp.watch(['./*.go', './data/*.json', './src/**/*'], [
    'build'
  ]);
});
