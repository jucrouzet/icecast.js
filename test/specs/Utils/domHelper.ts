import Bluebird = require('bluebird');
import events = require('events');

import DomHelper = require('../../../src/Utils/DomHelper');

import pageManipulation = require('../../utils/pageManipulation');



/* tslint:disable: missing-jsdoc */
const domHelper = (expect: Chai.ExpectStatic, $: JQueryStatic): void => {
  describe('DomHelper', (): void => {

    describe('GetAudioElements', (): void => {
      it('Should detect audio elements', (): any => {
        return expect(
          pageManipulation.replaceContentWith('DomHelper.1.html').then(() : void => {
            const expected = $('[data-test="true"]');
            let result = DomHelper.GetAudioElements();

            expected.each((i: number, elem: HTMLElement): void => {
              if (!result.filter(
                (node: HTMLAudioElement): boolean => $(elem).is($(node))
              ).length) {
                throw new Error(`${elem.outerHTML} should be in result`);
              }
              result = result.filter((node: HTMLAudioElement): boolean => !$(elem).is($(node)));
            });
            if (result.length) {
              throw new Error(`${result[0].outerHTML} should NOT be in result`);
            }
          })
        ).to.eventually.be.fulfilled;
      });
    });

    describe('WatchAudioElements', (): void => {
      it('Should emit an added event when adding valid and non associated with Player audio tags', (): any => {
        let countValid: number = 0;

        return expect(
          pageManipulation
            .replaceContentWith('DomHelper.1.html')
            .then(() : Bluebird<{}> => new Bluebird((resolve: Function, reject: Function) => {
              const watcher: events.EventEmitter = DomHelper.WatchAudioElements();

              watcher
              .on('added', (audio: HTMLAudioElement): void => {
                if (audio.getAttribute('data-test') !== 'true') {
                  reject(new Error(`${audio.outerHTML} should not have dispatch a "added" event`));
                }
                countValid += 1;
              });
              pageManipulation.appendContent('DomHelper.2.html');
          }))
            .timeout(1000)
            .catch((err: Error): Bluebird<void> => {
              if (err.message === 'operation timed out') {
                if (countValid === 3) {
                  return Bluebird.resolve();
                }
                throw new Error(`${countValid} added event emitted instead of 3`);
              }
              throw err;
            })
        ).to.eventually.be.fulfilled;
      });

      it('Should emit a removed event when removing valid audio tags', (): any => {
        let countValid: number = 0;

        return expect(
          pageManipulation
            .replaceContentWith('DomHelper.3.html')
            .then(() : Bluebird<{}> => new Bluebird((resolve: Function, reject: Function) => {
              const watcher: events.EventEmitter = DomHelper.WatchAudioElements();

              watcher
              .on('removed', (audio: HTMLAudioElement): void => {
                if (audio.getAttribute('data-test') !== 'true') {
                  reject(new Error(`${audio.outerHTML} should not have dispatch a "removed" event`));
                }
                countValid += 1;
              });
              pageManipulation.removeContent();
          }))
            .timeout(1000)
            .catch((err: Error): Bluebird<void> => {
              if (err.message === 'operation timed out') {
                if (countValid === 4) {
                  return Bluebird.resolve();
                }
                throw new Error(`${countValid} removed event emitted instead of 3`);
              }
              throw err;
            })
        ).to.eventually.be.fulfilled;
      });
    });
  });
};

export = domHelper;
