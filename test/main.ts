/* tslint:disable: missing-jsdoc */
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const expect: Chai.ExpectStatic = chai.expect;

require('mutationobserver-shim');

const tests: Function[] = [
  require('./Utils/domHelper'),
];


/* tslint:disable: no-string-literal */
const jQuery: JQueryStatic = (<any>window)['jQuery'];
/* tslint:enable: no-string-literal */

(<any>window).declareIcecastTests = (): void => {
  tests.forEach(test => test(expect, jQuery));
};

