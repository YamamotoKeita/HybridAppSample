const gulp = require('gulp');
const webserver = require('gulp-webserver');
const concat = require("gulp-concat");
const sass = require('gulp-sass');
const sftp = require('gulp-sftp');
const fileList = require('gulp-filelist');
const concatUtil = require('gulp-concat-util');
const path = require('path');
const bulkSass = require('gulp-sass-bulk-import');
const del = require('del');
const runSequence = require('run-sequence');
const uglify = require('gulp-uglify');
const cssMin = require('gulp-cssmin');
const htmlMin = require('gulp-htmlmin');
const rename = require('gulp-rename');
const babel = require("gulp-babel");
const browserify = require("browserify");
const babelify = require("babelify");
const source = require("vinyl-source-stream");
const transform = require('vinyl-transform');
const through2 = require("through2");
const events = require("events");

var ev = new events.EventEmitter;

ev.on("error", function(){
    throw "An error occurred."
});

gulp.task('webserver', function () {
    return gulp.src('htdocs')
        .pipe(webserver({
            host: '0.0.0.0',
            port: 8020,
            livereload: {
                enable: true,
                filter: function(path) {
                    if (path.match(/main.js$/) ||
                        path.match(/style.css$/) ||
                        path.match(/main.html$/) ||
                        path.match(/index.html$/)) {
                        return true;
                    }
                    return false;
                }
            }
        }));
});

gulp.task('babelify', function () {
    return browserify({
        entries: "src/main.js",
        extensions: [".js"]
    })
        .transform(babelify, {presets: ['es2015']})
        .bundle()
        .on("error", function (err) {
            console.log("Error : " + err.message);
            console.log(err.stack);
            ev.emit("error");
        })
        .pipe(source("main.js"))
        .pipe(gulp.dest("htdocs"));
});

gulp.task('babelify-worker', function () {
    return browserify({
        entries: "src/worker/worker-connector.js",
        extensions: [".js"]
    })
        .transform(babelify, {presets: ['es2015']})
        .bundle()
        .on("error", function (err) {
            console.log("Error : " + err.message);
            console.log(err.stack);
            ev.emit("error");
        })
        .pipe(source("worker-connector.js"))
        .pipe(gulp.dest("htdocs/worker"));
});

gulp.task('concat-html', function() {
    return gulp.src(['src/view/**/*.html'])
        .pipe(concatUtil('main.html',{process: function(src, filePath) {
            return '<!-- View Template [' + path.basename(filePath, ".html") + '] -->\n' + src;
        }}))
        .pipe(gulp.dest('htdocs'));
});

gulp.task('sass', function(callback){
    return gulp.src('src/view/style.scss')
        .pipe(bulkSass())
        .pipe(sass())
        .pipe(gulp.dest('htdocs'));
});

gulp.task('imageList', function(){
    return gulp.src(['htdocs/img/**/*', '!htdocs/img/imglist.json'])
        .pipe(fileList('imglist.json'))
        .pipe(gulp.dest('htdocs/img'));
});

gulp.task('upload', ['build'], function () {
    // using private key "~/.ssh/id_dsa" and "/.ssh/id_rsa"
    return gulp.src([
        'htdocs/**/*'
        ,'!htdocs/.gitignore'
    ]).pipe(sftp({
            host: 'sbi.cross-dev.net',
            user: 'ka_yamamoto',
            remotePath: '/var/www/sbi/toshinsp',
            pass: 'q8xnc2rj'
        }));
});

gulp.task('minify-html', ['concat-html'], function(){
    return gulp.src('htdocs/main.html')
        .pipe(htmlMin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('htdocs'));
});

gulp.task('minify-css', ['sass'], function(){
    return gulp.src('htdocs/style.css')
        .pipe(cssMin())
        // .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('htdocs'));
});

// gulp-uglify 1.5.4が対応している古いUglifyのドキュメント
// https://github.com/mishoo/UglifyJS2/tree/v2.x#mangle
gulp.task('minify-js', ['babelify'], function () {
    return gulp.src('htdocs/main.js')
        .pipe(uglify({
            preserveComments: 'some',
            mangle: {
                keep_fnames: true,
            },
            compress : {
                keep_fnames: true,
            },
        }))
        .pipe(gulp.dest('htdocs'));
});

// upload用のビルド：minify有り
gulp.task('build', function(callback) {
    return runSequence(
        'minify-css',
        ['minify-html', 'imageList'],
        'minify-js',
        'babelify-worker',
        callback
    );
});

// 開発用のビルド：minify無し
gulp.task('debug-build', function(callback) {
    return runSequence(
        'sass',
        ['concat-html', 'imageList'],
        'babelify',
        'babelify-worker',
        callback
    );
});

gulp.task('watch', function(){
    var w_babelify = gulp.watch(['src/**/*.js'], ['babelify','babelify-worker']);
    var w_concat_html = gulp.watch(['src/view/**/*.html'], ['concat-html']);
    var w_sass = gulp.watch('src/**/*.scss', ['sass']);

    // show log
    w_babelify.on('change', function(event){
        console.log('javascript ' + event.path + ' was ' + event.type + ', running task concat...');
    });
    w_concat_html.on('change', function(event){
        console.log('HTML ' + event.path + ' was ' + event.type + ', running task concat...');
    });
    w_sass.on('change', function(event) {
        console.log('SCSS File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
});

gulp.task('default', ['debug-build', 'webserver', 'watch']);
