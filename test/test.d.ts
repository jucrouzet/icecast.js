/**
 * Tests global TS definitions.
 */

/**
 * Static server port.
 */
declare var staticPort: Number;

/**
 * Chai's BDD expect() function.
 */
declare var expect: Chai.ExpectStatic;

/**
 * Declare the runTest() method on pages.
 */
interface Window {
  /**
   * Run the exported test on browser.
   *
   * @param test Test name.
   * @param args Arguments.
   */
  runTest(test: string, ...args: any[]): any;
}
