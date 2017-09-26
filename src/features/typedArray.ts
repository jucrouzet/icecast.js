import { IFeature } from './IFeature';

/**
 * Test if typed array are available.
 */
export const typedArray: IFeature = {
  name: 'Typed Array',
  test: (): boolean => {
    return (typeof Uint8Array === 'function');
  },
};
