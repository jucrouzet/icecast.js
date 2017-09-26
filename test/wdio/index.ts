import {runTest} from './utils';

/**
 * Utils functions.
 */
describe('utils', () => {
  it('Should pass tests', () => {
    browser.url('/blank.html');
    runTest(browser, 'utils.js');
  });
});


/**
 * Player class
 */
describe('Player', () => {
  it('Should pass tests', () => {
    browser.url('/player.html');
    runTest(browser, 'player.js');
  });
});
