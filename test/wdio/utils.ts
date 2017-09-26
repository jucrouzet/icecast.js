import {RawResult} from 'webdriverio';

/**
 * Inject browser results in WDIO result.
 */
function injectTests(result: any) {
  describe(result.title, () => {
    for (const test of result.success) {
      it(test.title, () => { return true; });
    }
    for (const test of result.fails) {
      it(test.title, () => { throw new Error(test.err); });
    }
  });
  for (const child of result.children) {
    injectTests(child);
  }
}

/**
 * Runs a test file.
 */
export function runTest(browser: WebdriverIO.Client<void>, file: string): void {
  const result: RawResult<Error | any[]> = browser.executeAsync(
    function(file, done) {
      const script: HTMLScriptElement = document.createElement('script');
      let loaded: boolean = false;

      script.type = 'text/javascript';
      script.src = `/scripts/${file}`;
      script.onload = (<any>script).onreadystatechange = () => {
        //console.log( this.readyState ); //uncomment this line to see which ready states are called.
        if (!loaded && (!(<any>script).readyState || (<any>script).readyState == 'complete')) {
          loaded = true;
          const getTestResult = (suite: any) => {
            const result: any = {
              title: suite.title,
              children: [],
              success: [],
              fails: [],
            };

            if (suite.suites.length) {
              for (const child of suite.suites) {
                result.children.push(getTestResult(child));
              }
            }
            for (const test of suite.tests) {
              if (test.state === 'passed') {
                result.success.push({title: test.title});
              } else if (test.state === 'failed') {
                result.fails.push({title: test.title, err: test.err.stack || test.err.message});
              } else {
                result.fails.push({title: test.title, err: 'Unknown test error/state'});
              }
            }
            return result;
          };

          (<any>window).after('Notify wdio', function () {
            (<any>this).timeout(10000);
            done([
              getTestResult((<any>window).mocha.suite),
              (<any>window).__coverage__
            ]);
          });
        }
      };
      (document.getElementsByTagName('body')[0]).appendChild(script);
      script.onerror = (ev: ErrorEvent) => {
        if (!loaded) {
          loaded = true;
          done((ev.error instanceof Error) ? ev.error : new Error(ev.error));
        }
      };
    },
    file,
  );
  if (Array.isArray(result.value) && result.value.length === 2) {
    injectTests(result.value[0]);
    (<any>browser).parseCoverage(file, result.value[1]);
    return;
  }
  if (result.value instanceof Error) {
    throw result.value;
  }
  throw new Error('Unknown return value from test script');
}
