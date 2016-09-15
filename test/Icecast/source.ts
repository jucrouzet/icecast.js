import Bluebird = require('bluebird');
import events = require('events');

import Source = require('../../src/Icecast/Source');

import pageManipulation = require('../utils/pageManipulation');



/* tslint:disable: missing-jsdoc */
const source = (expect: Chai.ExpectStatic, $: JQueryStatic): void => {
  describe('Icecast/Source', (): void => {

    describe('load()', (): void => {
      it('Should work on a valid M3U playlist', (): any => {
        const testedSource = new Source('test/fixtures/playlist/valid.m3u');

        expect(testedSource.load()).to.eventually.be.fulfilled;
      });
    });
  });
};

export = source;
