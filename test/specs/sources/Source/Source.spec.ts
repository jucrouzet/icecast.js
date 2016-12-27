/**
 * Source class tests.
 */
import Bluebird = require('bluebird');

describe('Source class', (): void => {
  before('Load page', (): void => {
    browser.url(`http://localhost:${staticPort}/specs/sources/Source/Source.html`);
  });

  describe('#constructor', (): void => {
    it('Should work with correct parameters', (): any => {
      return expect(
        Bluebird.all([
          browser.execute(
            'return window.runTest("constructor", "http://www.example.com");'
          ),
          browser.execute(
            'return window.runTest("constructor", "http://www.example.com/");'
          ),
          browser.execute(
            'return window.runTest("constructor", "http://www.example.com/stream.m3u");'
          ),
          browser.execute(
            'return window.runTest("constructor", "http://www.example.com/blah.unknown");'
          ),
          browser.execute(
            'return window.runTest("constructor", "http://www.example.com/blah.unknown", "not a mimetype");'
          ),
          browser.execute(
            'return window.runTest("constructor", "http://www.example.com/blah.ogg", "audio/x-mpegurl");'
          ),
        ])
        .then((rets: WebdriverIO.RawResult<any>[]): string => {
          rets.forEach((ret: WebdriverIO.RawResult<any>): void => {
            if (!ret.value) {
              throw new Error('No return from browser');
            }
            if (ret.value !== 'ok') {
              throw new Error(`Got "${ret.value}" from a valid instanciation`);
            }
          });
          return 'ok';
        })l
      ).to.eventually.be.equal('ok', 'Calling constructor with valid arguments should fullfill');
    });

    it('Should NOT work with incorrect parameters', (): any => {
      return expect(
        Bluebird.all([
          browser.execute(
            'return window.runTest("constructor");'
          ),
          browser.execute(
            'return window.runTest("constructor", "");'
          ),
        ])l
        .then((rets: WebdriverIO.RawResult<any>[]): string => {
          rets.forEach((ret: WebdriverIO.RawResult<any>): void => {
            if (!ret.value) {
              throw new Error('No return from browser');
            }
            if (ret.value === 'ok') {
              throw new Error('Instanciation with invalid arguments did not failed');
            }
          });
          return 'ok';
        })
      ).to.eventually.be.equal('ok', 'Calling constructor with valid arguments should fullfill');
    });

    it('Should guess the correct mimetype from known playlists extensions', (): any => {
      const extensionToType: {} = {
        xspf: 'application/xspf+xml',
        m3u: 'audio/x-mpegurl',
        m3u8: 'audio/x-mpegurl',
      };

      return expect(
        Bluebird.reduce(
          Object.keys(extensionToType),
          (accumulator: string[], extension: string) => {
            return browser.execute(
              `return window.runTest("guessMimetype", "http://example.org/stream.${extension}");`
            ).then((ret: WebdriverIO.RawResult<any>) => {
              if (!ret.value) {
                return accumulator.concat('MimeType not guessed');
              }
              if (typeof ret.value !== 'string') {
                return accumulator.concat('Guessed mimetype is not a string');
              }
              return accumulator.concat(ret.value);
            });
          },
          []
        ).then((guessedTypes: string[]): string => {
          const extensions: string[] = Object.keys(extensionToType);
          const types: string[] = [];

          Object.keys(extensionToType).forEach((extension: string): void => {
            types.push((<any>extensionToType)[extension]);
          });
          guessedTypes.forEach((guessedType: string, index: number): void => {
            if (types[index] !== guessedType) {
              throw new Error(
                `Extension "${extensions[index]}" should have been guessed as "${types[index]}", not "${guessedTypes[index]}"`
              );
            }
          });
          return 'ok';
        })
      ).to.eventually.be.equal('ok', 'Guessed mimetypes are not correct');
    });
  });

  describe('#load', (): void => {
    it('Should parses correctly a valid .m3u playlist', (): any => {
      const playlistURL: string = `http://localhost:${staticPort}/fixtures/playlists/valid.m3u`;

      return browser.execute(
        `return window.runTest("getPlaylistStreams", "${playlistURL}");`
      ).then((ret: WebdriverIO.RawResult<any>) => {
        if (!ret.value) {
          throw new Error('No return from browser');
        }
        if (!Array.isArray(ret.value)) {
          throw new Error(`Browser returned : ${JSON.stringify(ret.value)}`);
        }
        console.log(ret.value);
      });

    });
  });
});
