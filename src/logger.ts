import * as Utils from './utils';

import * as LogLevel from 'loglevel';

LogLevel.setLevel(__LOG_LEVEL__);

const prefix: any = require('loglevel-plugin-prefix'); //tslint:disable-line: no-any no-var-requires

prefix.apply(LogLevel, {
  template: '%n',
  nameFormatter: (name: string): string => {
    if (Utils.isUndefined(name)) {
      return '';
    }
    return `[${name}]: `;
  },
});

/**
 * Get a named logger instance.
 */
export function logger(instanceName?: string): Log {
  const name: string = (Utils.isUndefined(instanceName)) ? 'Icecast.js' : `Icecast.js/${instanceName}`;
  const instance: Log = LogLevel.getLogger(name);

  instance.setLevel(__LOG_LEVEL__);
  return instance;
}
