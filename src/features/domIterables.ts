import { IFeature } from './IFeature';

/**
 * Test if DOM Iterables are supported.
 */
export const domIterables: IFeature = {
  name: 'DOM Iterables',
  test: (): boolean => {
    return (
      (typeof Symbol === 'function') &&
      (typeof Symbol.iterator === 'symbol')
    );
  },
};
