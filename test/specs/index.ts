import Path = require('path');

const glob = require('glob');


glob(Path.join(__dirname, '**', '*.js'), (error: Error, files: string[]): void => {
  console.log(files);
});

/**
var assert = require('assert');
describe('webdriver.io page', function() {
  it('should have the right title', function () {
    browser.url('http://webdriver.io');
    var title = browser.getTitle();
    assert.equal(title, 'WedriverIO - Selenium 2.0 javascript bindings for nodejs');
  });
});
*/
