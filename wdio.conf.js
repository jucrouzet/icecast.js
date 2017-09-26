const fs = require('fs');
const glob = require('glob');
const path = require('path');
const istanbul = require('istanbul');
const remapIstanbul = require('remap-istanbul');
const rimraf = require('rimraf');

const coverageDir = path.resolve(__dirname, 'coverage');

const wsCapabilities = desiredCapabilities => Object.assign(desiredCapabilities, {
  'browserstack.networkLogs': true,
  'browserstack.local': true,
  'browserstack.debug': true,
});

const config = {

  services: ['webpack', 'static-server'],

  webpackConfig: require('./webpack/test'),
  webpackLogs: (typeof process.env.DEBUG_TESTING === 'string'),

  staticServerFolders: [
    {mount: '/', path: path.resolve(__dirname, 'test', 'static')},
    {mount: '/lib', path: path.resolve(__dirname, 'dist')},
  ],

  specs: [
    'test/wdio/tests.js'
  ],

  debug: (typeof process.env.DEBUG_TESTING === 'string'),
  sync: true,

  // silent | verbose | command | data | result | error
  logLevel: (typeof process.env.DEBUG_TESTING === 'string') ? 'verbose' : 'error',
  coloredLogs: true,

  maxInstances: 2,
  bail: 0,
  screenshotPath: path.resolve(__dirname, 'coverage', 'shots'),
  baseUrl: 'http://localhost:4567',
  waitforTimeout: 1000,
  framework: 'mocha',
  reporters: ['spec'],
  reporterOptions: {
    outputDir: path.resolve(__dirname, 'coverage'),
  },
  mochaOpts: {
    ui: 'bdd',
    timeout: 600000,
  },

  capabilities: [

    // Latest chrome
    wsCapabilities({
      browserName: 'chrome',
      version: '61',
      platform: 'MAC',
    }),
    // Oldest compatible chrome
    wsCapabilities({
      browserName: 'chrome',
      version: '45',
      platform: 'WINDOWS',
    }),
    /**
     // Latest ffox
     wsCapabilities({
      browserName: 'firefox',
      version: '55',
      platform: 'WIN8',
    }),
     // Oldest compatible firefox
     wsCapabilities({
      browserName: 'firefox',
      version: '42',
      platform: 'MAC',
    }),
     */
    /**
     * RealMobile <=> Local => Boom
     // Chrome android
     wsCapabilities({
      browserName: 'ANDROID',
      realMobile: true,
    }),
     */

    // {
    // maxInstances: 5,
    // browserName: 'firefox',
    // specs: [
    //   'test/ffOnly/*'
    // ]
    // },
    // {
    // browserName: 'phantomjs',
    // exclude: [
    //   'test/spec/alert.js'
    // ]
    // }
  ],


  // =====
  // Hooks
  // =====
  /**
   * Gets executed once before all workers get launched.
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   */
  onPrepare: function (config, capabilities) {
    if (fs.existsSync(coverageDir)) {
      console.log('Emptying coverage directory');
      rimraf.sync(path.resolve(coverageDir, '**/*'));
    } else {
      console.log('Creating coverage directory');
      fs.mkdirSync(coverageDir);
    }
  },
  /**
   * Gets executed just before initialising the webdriver session and test framework. It allows you
   * to manipulate configurations depending on the capability or spec.
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that are to be run
   */
  beforeSession: function (config, capabilities, specs) {
  },
  /**
   * Gets executed before test execution begins. At this point you can access to all global
   * variables like `browser`. It is the perfect place to define custom commands.
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that are to be run
   */
  before: function (capabilities, specs) {
    const srcDir = path.resolve(__dirname, 'src');

    browser.timeouts('script', 600000);

    browser.addCommand(
      'parseCoverage',
      (file, coverage) => {
        if (
          (typeof file !== 'string') ||
          (file.length === 0) ||
          (typeof coverage !== 'object')
        ) {
          return;
        }

        Object.keys(coverage).forEach((file) => {
          if (
            (file.indexOf(srcDir) !== 0) ||
            // Coverage fails on file loaded as workers...
            (file.match(/\/workers\//))
          ) {
            delete coverage[file];
          }
        });

        const filename = [
          'coverage',
          file.replace(/\W+/, '_'),
          Math.ceil(Math.random() * 1000000),
          'partial',
          'json'
        ].join('.');
        fs.writeFile(
          path.resolve(__dirname, 'coverage', filename),
          JSON.stringify(coverage),
          (err) => {
            if (err) {
              console.warn(`Could not write coverage file: ${err}`);
            }
          },
        );
        return;
      },
    );
  },
  /**
   * Hook that gets executed before the suite starts
   * @param {Object} suite suite details
   */
  beforeSuite: function (suite) {
  },
  /**
   * Hook that gets executed _before_ a hook within the suite starts (e.g. runs before calling
   * beforeEach in Mocha)
   */
  beforeHook: function () {
  },
  /**
   * Hook that gets executed _after_ a hook within the suite starts (e.g. runs after calling
   * afterEach in Mocha)
   */
  afterHook: function () {
  },
  /**
   * Function to be executed before a test (in Mocha/Jasmine) or a step (in Cucumber) starts.
   * @param {Object} test test details
   */
  beforeTest: function (test) {
  },
  /**
   * Runs before a WebdriverIO command gets executed.
   * @param {String} commandName hook command name
   * @param {Array} args arguments that command would receive
   */
  beforeCommand: function (commandName, args) {
  },
  /**
   * Runs after a WebdriverIO command gets executed
   * @param {String} commandName hook command name
   * @param {Array} args arguments that command would receive
   * @param {Number} result 0 - command success, 1 - command error
   * @param {Object} error error object if any
   */
  afterCommand: function (commandName, args, result, error) {
  },
  /**
   * Function to be executed after a test (in Mocha/Jasmine) or a step (in Cucumber) starts.
   * @param {Object} test test details
   */
  afterTest: function (test) {
  },
  /**
   * Hook that gets executed after the suite has ended
   * @param {Object} suite suite details
   */
  afterSuite: function (suite) {
  },
  /**
   * Gets executed after all tests are done. You still have access to all global variables from
   * the test.
   * @param {Number} result 0 - test pass, 1 - test fail
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that ran
   */
  after: function (result, capabilities, specs) {
  },
  /**
   * Gets executed right after terminating the webdriver session.
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that ran
   */
  afterSession: function (config, capabilities, specs) {
  },
  /**
   * Gets executed after all workers got shut down and the process is about to exit.
   * @param {Object} exitCode 0 - success, 1 - fail
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   */
  onComplete: (exitCode, config, capabilities) => {
    if (exitCode !== 0) {
      return;
    }
    const collector = new istanbul.Collector();
    const reporter = new istanbul.Reporter();

    console.log('Aggregating coverage files');
    const origFiles = glob.sync(
      '*.partial.json',
      {
        cwd: coverageDir,
        root: '/',
      }
    );

    origFiles.forEach(file => collector.add(
      JSON.parse(
        fs.readFileSync(
          path.resolve(coverageDir, file),
          'utf8',
        )
      )
    ));
    reporter.add('json');
    reporter.write(collector, true, () => {
      console.log('Renaming aggregated coverage file');
      fs.rename(
        path.resolve(coverageDir, 'coverage-final.json'),
        path.resolve(coverageDir, 'coverage-before-remap.json')
      );
      console.log('Remapping aggregated coverage file');
      remapIstanbul(
        path.resolve(coverageDir, 'coverage-before-remap.json'),
        {
          json: path.resolve(coverageDir, 'coverage-final.json'),
          html: coverageDir,
        },
      )
        .then(() => {
          console.log('Cleaning coverage files');
          origFiles.forEach(file => fs.unlinkSync(path.resolve(coverageDir, file)));
          fs.unlinkSync(path.resolve(coverageDir, 'coverage-before-remap.json'));
        })
        .catch(console.warn.bind(null));
    });
  },
};

if (process.env.BROWSERSTACK) {
  if (
    (typeof process.env.BROWSERSTACK_USERNAME !== 'string') ||
    (!process.env.BROWSERSTACK_USERNAME) ||
    (typeof process.env.BROWSERSTACK_ACCESS_KEY !== 'string') ||
    (!process.env.BROWSERSTACK_ACCESS_KEY)
  ) {
    console.warn('You need to set the BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY');
    console.warn('environment variables to run the test in BrowserStack mode');
    process.exit(255);
  }
  config.services.push('browserstack');
  config.user = process.env.BROWSERSTACK_USERNAME;
  config.key = process.env.BROWSERSTACK_ACCESS_KEY;
  config.browserstackLocal = true;
  config.browserstackOpts = {
    verbose: (process.env.DEBUG_TESTING) ? 3 : 1
  }
} else {
  config.services.push('selenium-standalone');
}

exports.config = config;
