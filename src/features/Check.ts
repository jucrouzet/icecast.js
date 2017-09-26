import {logger} from '../logger';
import {IFeature, isFeature} from './IFeature';

const log: Log = logger('BrowserFeatures');

/**
 * Checks if needed browser features are available.
 */
//tslint:disable: no-any
export function check(): boolean { //tslint:disable-line: export-name
  let validBrowser: boolean = true;
  const context: any = require.context('./', false, /\/[a-z]\w+\.ts/);

  for (const key of context.keys()) {
    const exported: any = context(key);

    if ((typeof exported !== 'object') || (Object.keys(exported).length === 0)) {
      log.warn('Ignoring feture file "', key, '", which does not export an object or a property-less object');
      continue;
    }
    Object.keys(exported).forEach((name: string) => {
      const test: IFeature = exported[name];

      if (!isFeature(test)) {
        log.warn('Ignoring feature', name, ' in file "', key, '", which is not an IFeature obj');
        return;
      }
      if (!test.test()) {
        logger().warn(`The "${test.name} feature is missing in browser`);
        validBrowser = false;
      }
    });
  }
  return validBrowser;
}
//tslint:enable: no-any
