const gulp = require('gulp');
const clean = require('gulp-clean');
const minify = require('gulp-minify');
const mocha = require('gulp-mocha');
const gulpsync = require('gulp-sync')(gulp);
const gulpTslint = require('gulp-tslint');
const gutil = require('gulp-util');
const webserver = require('gulp-webserver');


const browserify = require('browserify');
const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');
const portfinder = require('portfinder');
const source = require('vinyl-source-stream');
const tsify = require('tsify');
const tslint = require('tslint');


const pjson = require('./package.json');
const distDir = path.join(__dirname, 'dist');
const vendorFile = `icecast${pjson.version ? `.${pjson.version}` : ''}.vendor.js`;
const watchFile = `icecast.watch.js`;
const debugFile = `icecast${pjson.version ? `.${pjson.version}` : ''}.js`;

/**
 * Configure typescript.
 */
const tsConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'tsconfig.json')));

/**
 * Clean built files.
 */
gulp.task(
  'clean:coverage',
  () => gulp.src(
    [
      'coverage/**/*',
      '!coverage/.gitkeep',
    ],
    { read: false }
  )
    .pipe(clean())
);

gulp.task(
  'clean:built',
  () => gulp.src(
    [
      vendorFile,
      debugFile,
    ],
    { read: false }
  )
    .pipe(clean())
);

gulp.task('clean', ['clean:coverage', 'clean:built']);

/**
 * Run TSLint.
 */
gulp.task('tslint:generateConf', (cb) => {
  exec(path.join(__dirname, 'generateTslintJson.js'), (err, stdout, stderr) => {
    if (err) {
      return cb(new Error(stderr));
    }
    gutil.log(stdout.replace(/[\r?\n]*$/, ''));
    cb();
  });
});

gulp.task(
  'tslint',
  ['tslint:generateConf'],
  () => {
    const program = tslint.Linter.createProgram('./tsconfig.json');

    return gulp.src('src/**/*.ts', { base: '.' })
      .pipe(
        gulpTslint({
          program,
          formatter: 'verbose',
          rulesDirectory: 'node_modules/tslint-microsoft-contrib',
          configuration: require('./tslint.json'),
        })
      )
      .pipe(gulpTslint.report({
        emitError: !!process.env.STRICT_LINT,
      }));
  }
);

/**
 * Compile TS and broserify.
 */
const compile = (stream, file, tsifyOptions) => {
  return stream
    .plugin(tsify, Object.assign({ stopOnError: false }, tsifyOptions))
      .bundle()
      .on('error', (error) => {
        gutil.log(
          gutil.colors.red('Typescript compilation failed'),
          error.message || error
        );
        if (process.env.STRICT_COMPILE) {
          throw error;
        }
      })
      .pipe(source(file))
};

gulp.task(
  'build:vendor:build',
  () => {
    const stream =  browserify(
      'main.ts',
      {
        basedir: path.join(__dirname, 'src'),
      }
    );

    return compile(stream, vendorFile)
      .pipe(gulp.dest(distDir));
  }
);

gulp.task(
  'build:vendor',
  ['build:vendor:build'],
  () => {
    return gulp.src(path.join(distDir, vendorFile))
      .pipe(minify({
        ext:{
          src:'.js',
          min:'.min.js'
        },
      }))
      .pipe(gulp.dest(distDir))
  }
);

gulp.task(
  'build:debug',
  () => {
    const stream =  browserify(
      'main.ts',
      {
        basedir: path.join(__dirname, 'src'),
        debug: true,
      }
    );

    return compile(stream, debugFile)
      .pipe(gulp.dest(distDir));
  }
);

gulp.task(
  'build:watch',
  () => {
    const stream =  browserify(
      'main.ts',
      {
        basedir: path.join(__dirname, 'src'),
        debug: true,
      }
    );

    return compile(stream, watchFile)
      .pipe(gulp.dest(distDir));
  }
);


/**
 * Watch mode.
 */
gulp.task('watch:webserver', function(cb) {
  portfinder.getPort(function (err, port) {
    if (err) {
      gutil.colors.red(`Unable to find an available port: ${err.message || err}`);
      return cb(err);
    }
    gulp.src(path.join(__dirname, 'dist'))
      .pipe(webserver({
        livereload: false,
        host: '0.0.0.0',
        port,
      }));
    cb();
  });
});

gulp.task(
  'watch',
  gulpsync.sync([['clean:built', 'watch:webserver'], ['tslint', 'build:watch']]),
  function () {
    gulp.watch(['src/**/*.ts'], ['tslint', 'build:watch']);
  }
);

/**
 * Make a release.
 */
gulp.task(
  'release:setStrict',
  (cb) => {
    process.env.STRICT_LINT = 1;
    process.env.STRICT_COMPILE = 1;
    cb();
  }
);
gulp.task(
  'release',
  gulpsync.sync([
    [
      'clean:built',
      'release:setStrict',
    ],
    'build:vendor',
    'build:debug',
  ])
);

