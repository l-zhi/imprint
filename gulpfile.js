(function() {
  'use strict'
  var gulp = require('gulp'),
    connect = require('gulp-connect'),
    sass = require('gulp-sass'),
    del = require('del'),
    open = require('gulp-open'),
    uglify = require('gulp-uglify'),
    gutil = require('gulp-util'),
    sourcemaps = require('gulp-sourcemaps'),
    rename = require('gulp-rename'),
    header = require('gulp-header'),
    concat = require('gulp-concat')

  var paths = {
      port: 3301,
      root: './',
      dist: {
        root: 'dist/',
        style: 'dist/css/',
        script: 'dist/js/'
      },
      source: {
        root: 'src/',
        style: 'src/sass/*.scss',
        script: ['src/js/lib/*.js', 'src/js/*.js']
      },
      html: './index.html',
      playground: {
        root: './'
      }
    },
    Plugin = {
      filename: 'imprint',
      jQueryFiles: [paths.source.root + 'js/imprint.js'],
      pkg: require('./package.json'),
      banner: [
        '/**',
        ' * Imprint <%= pkg.version %>',
        ' * <%= pkg.description %>',
        ' * ',
        ' * <%= pkg.homepage %>',
        ' * ',
        ' * Copyright <%= date.year %>, <%= pkg.author %>',
        ' * ',
        ' * Licensed under <%= pkg.license %>',
        ' * ',
        ' * Released on: <%= date.month %> <%= date.day %>, <%= date.year %>',
        ' */',
        ''
      ].join('\n'),
      date: {
        year: new Date().getFullYear(),
        month: 'January February March April May June July August September October November December'.split(
          ' '
        )[new Date().getMonth()],
        day: new Date().getDate()
      }
    }

  var _style = function() {
    return gulp
      .src(paths.source.style)
      .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
      .pipe(gulp.dest(paths.dist.style))
  }

  var _html = function() {
    return gulp.src(paths.html)
  }

  var _script = function() {
    return gulp.src(paths.source.script)
  }

  gulp.task('clean', function() {
    return del(paths.dist.root + '**', { force: true })
  })

  gulp.task('connect', function() {
    return connect.server({
      root: [paths.root],
      livereload: true,
      port: paths.port
    })
  })

  gulp.task('watch:style', function() {
    return _style().pipe(connect.reload())
  })

  gulp.task('watch:html', function() {
    return _html().pipe(connect.reload())
  })

  gulp.task('watch:script', function() {
    gulp
      .src(Plugin.jQueryFiles)
      .pipe(concat(Plugin.filename + '.js'))
      .pipe(header(Plugin.banner, { pkg: Plugin.pkg, date: Plugin.date }))
      .pipe(gulp.dest(paths.dist.script))
      .pipe(connect.reload())
  })

  gulp.task('build:style', function() {
    del.sync(paths.dist.style)
    return _style()
  })

  gulp.task('build:html', function() {
    return _html()
  })

  gulp.task('build:script', function() {
    del.sync(paths.dist.script)
    gulp
      .src(Plugin.jQueryFiles)
      .pipe(concat(Plugin.filename + '.js'))
      .pipe(header(Plugin.banner, { pkg: Plugin.pkg, date: Plugin.date }))
      .pipe(gulp.dest(paths.dist.script))
  })

  gulp.task('dist:script', function() {
    gulp
      .src(paths.dist.script + Plugin.filename + '.js')
      .pipe(concat(Plugin.filename + '.js'))
      .pipe(sourcemaps.init())
      .pipe(uglify())
      .on('error', function(err) {
        gutil.log(gutil.colors.red('[Error]'), err.toString())
      })
      .pipe(header(Plugin.banner, { pkg: Plugin.pkg, date: Plugin.date }))
      .pipe(
        rename(function(path) {
          path.basename = Plugin.filename + '.min'
        })
      )
      .pipe(sourcemaps.write('./maps'))
      .pipe(gulp.dest(paths.dist.script))
  })

  gulp.task('compile', ['build:html', 'build:script', 'build:style'], function(
    cb
  ) {
    cb && cb()
  })

  gulp.task('open', function() {
    return gulp.src(paths.playground.root + 'index.html').pipe(
      open({
        uri:
          'http://localhost:' +
          paths.port +
          '/' +
          paths.playground.root +
          'index.html'
      })
    )
  })

  gulp.task('watch', ['compile'], function() {
    gulp.watch([paths.html], ['watch:html'])
    gulp.watch([paths.source.script], ['watch:script'])
    gulp.watch([paths.source.style], ['watch:style'])
  })

  gulp.task('dev', ['watch', 'connect', 'open'])

  gulp.task('build', ['dist:script'])
}())
