module.exports = function (grunt) {
  'use strict';

  const pjson = require('./package.json');
  const vendorFile = `dist/icecast${pjson.version ? `.${pjson.version}` : ''}.min.js`;
  const debugFile = `dist/icecast${pjson.version ? `.${pjson.version}` : ''}.js`;
  const testsEnv= {};


  if (grunt.option('only') && (grunt.option('only').length)) {
    testsEnv['TEST_ONLY'] = grunt.option('only');
  }


  grunt.initConfig({
    browserify: {
      vendor: {
        src: ['src/main.ts'],
        dest: vendorFile,
        options: {
          browserifyOptions: {
            debug: true,
          },
          plugin: [
            [
              'tsify',
              [{
                project: './',
              }]
            ],
            ['minifyify',
              [{
                'no-map': true,
              }]
            ],
          ],
        }
      },
      debug: {
        src: ['src/main.ts'],
        dest: debugFile,
        options: {
          browserifyOptions: {
            debug: true,
          },
          plugin: [
            [
              'tsify',
              [{
                project: './',
              }]
            ]
          ],
        }
      },
      watch: {
        src: ['src/main.ts'],
        dest: 'dist/icecast.watch.js',
        options: {
          watch: true,
          keepAlive: true,
          browserifyOptions: {
            debug: true,
          },
          postBundleCB: (watchifyError, src, next) => {
            if (!watchifyError) {
              grunt.log.writeln("Running tslint ...");

              grunt.util.spawn(
                {
                  grunt: true,
                  args: ['tslint']
                },
                (tslintError, result, code)  => {
                  if (code) {
                    grunt.log.error(result.stdout);
                  } else {
                    grunt.log.ok("Tslint ok");
                  }
                  next(watchifyError, src);
                }
              );
            }
          },
          plugin: [
            [
              'tsify',
              [{
                project: './',
              }]
            ]
          ],
        }
      },
    },
    tslint: {
      options: {
        rulesDirectory: 'node_modules/tslint-microsoft-contrib',
        configuration: './tslint.json',
        force: false,
      },
      files: {
        src: ['src/**/*.ts'],
      },
    },
    webdriver: {
      test: {
        configFile: './wdio.conf.js',
      },
    },
    shell: {
      checkXvfb: {
        command: 'Xvfb -help > /dev/null 2>&1 || (echo "You must install Xvfb before running tests" && exit 1)',
        options: {
          async: false,
        },
      },
      seleniumInstall: {
        command: './node_modules/.bin/selenium-standalone install --drivers.firefox.version=0.9.0 --drivers.chrome.version=2.24 ',
        options: {
          async: false,
        },
      },
      seleniumStart: {
        command: 'xvfb-run --server-args="-screen 0, 1366x768x24" ./node_modules/.bin/selenium-standalone start --drivers.chrome.version=2.24  --drivers.firefox.version=0.9.0',
        options: {
          async: true,
        },
      },
      pretest: {
        command: './pretest.sh',
        options: {
          async: false,
        },
      },
    },
    wait: {
      selenium: {
        options: {
          delay: 5000,
          before : function(options) {
            grunt.log.writeln('Giving Selenium 5s to start');
          },
        },
      }
    },
    env: {
      test: testsEnv,
    },
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-tslint');
  grunt.loadNpmTasks('grunt-webdriver');
  grunt.loadNpmTasks('grunt-shell-spawn');
  grunt.loadNpmTasks('grunt-continue');
  grunt.loadNpmTasks('grunt-wait');
  grunt.loadNpmTasks('grunt-env');



  grunt.registerTask('default', [
    'tslint',
    'browserify:vendor',
    'browserify:debug'
  ]);
  grunt.registerTask('watch', [
    'browserify:watch'
  ]);
  grunt.registerTask('test', [
    'shell:pretest',
    'shell:checkXvfb',
    'shell:seleniumInstall',
    'shell:seleniumStart',
    'env:test',
    'continue:on',
    'wait:selenium',
    'webdriver',
    'continue:off',
    'shell:seleniumStart:kill',
    'continue:fail-on-warning',
  ]);

};
