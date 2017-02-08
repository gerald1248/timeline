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
  jsonminify = require('gulp-jsonminify'),
  os = require('os'),
  getos = require('getos'),
  md5 = require('gulp-md5');

var pkg = require('./package.json');
var platform = os.platform()
var arch = os.arch()
if (platform === "linux") {
  var obj = getos(function(e, os) {
    if (!e) {
      platform = os.dist + '-' + os.release;
      platform = platform.replace(/ /g, '_').toLowerCase();
    }
  });
}
var race = false;
var raceSwitch = (race) ? " -race" : "";

gulp.task('default', ['build', 'watch']);

gulp.task('build', function(callback) {
  runSequence(
    'clean-build',
    'get',
    'fmt',
    'vet',
    'build-api',
    'build-js',
    'build-css',
    'build-html',
    'build-i18n',
    'build-bindata',
    'build-go',
    'package-binary',
		'package-snakeoil',
    'dist',
    'clean-home',
    'build-sample',
    'test',
    callback);
});

gulp.task('build-api', function() {
  return gulp.src(['./api/timeline-schema.json'])
    .pipe(jsonminify().on('error', util.log))
    .pipe(gulp.dest('./static'))
});

gulp.task('build-i18n', function() {
  return gulp.src(['./i18n/i18n.json'])
    .pipe(jsonminify().on('error', util.log))
    .pipe(gulp.dest('./static'));
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
  exec('go build' + raceSwitch, function(err, stdout, stderr) {
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

gulp.task('package-snakeoil', function() {
	return gulp.src(['./tls/*'], { base: './tls/' })
    .pipe(gulp.dest('package'))
});

gulp.task('dist', function() {
  return gulp.src('./package/**/*', { base: './package' })
    .pipe(zip(pkg.name + '-' + pkg.version + '-' + platform + '-' + arch + '.zip'))
    .pipe(md5())
    .pipe(gulp.dest('./dist'));
});

gulp.task('build-sample', function(callback) {
  exec('package/timeline data/*.json', function(err, stdout, stderr) {
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
  exec('gofmt -d calendar.go routine.go server.go data.go theme.go draw.go locale.go timeline.go', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    callback(err);
  });
});

gulp.task('get', function(callback) {
  exec('go get .', function(err, stdout, stderr) {
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

gulp.task('clean-package', function() {
  return del.sync(['./package/*'], { force: true });
});

gulp.task('clean-home', function() {
  return del.sync(['./timeline', './timeline.exe'], { force: true });
});

gulp.task('clean-build', function() {
  return del.sync([
    './dist/' + pkg.name + '-*-' + platform + '_*.zip',
    './dist/' + pkg.name + '-*-' + platform + '-' + arch + '_*.zip',
    './package/**/*',
    './static/*.json'
  ], { force: true });
});

gulp.task('build-bindata', function(callback) {
  exec('go-bindata static/...', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    callback(err);
  });
});

//call this task to cross-compile
gulp.task('build-win32', function(callback) {
  runSequence(
    'get',
    'fmt',
    'vet',
    'build-api',
    'build-js',
    'build-css',
    'build-html',
    'build-i18n',
    'build-bindata',
		'install-go-win32',
    'build-go-win32',
    'clean-package',
    'package-binary',
    'dist',
    'clean-home',
    callback);
});

//install amd64 standard packages
gulp.task('install-go-win32', function(callback) {
  exec('GOOS=windows GOARCH=amd64 go install', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    callback(err);
  });
});

//now build with hardcoded win32 target
gulp.task('build-go-win32', function(callback) {
  platform = "win32"
  arch = "386"
  exec('GOOS=windows GOARCH=386 go build', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    callback(err);
  });
});

gulp.task('build-go-linux-x64', function(callback) {
  platform = "linux"
  arch = "x64"
  exec('GOOS=linux GOARCH=amd64 go build' + raceSwitch, function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    callback(err);
  });
});

gulp.task('build-linux', function(callback) {
  runSequence(
    //skip clean-build to retain dist
    'fmt',
    'vet',
    'build-js',
    'build-css',
    'build-html',
    'build-bindata',
    'build-go-linux-x64',
    'clean-package',
    'package-binary',
    'package-snakeoil',
    'dist',
    'clean-home',
    //skip tests as binary won't run
    callback);
});

gulp.task('watch', function() {
  gulp.watch(['./*.go', './data/*.json', './src/**/*'], [
    'build'
  ]);
});
