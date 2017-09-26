import { IFeature } from './IFeature';

/**
 * Test if URL interface is available.
 */
export const urlInterface: IFeature = {
  name: 'URL Interface',
  test: (): boolean => {
    return (
      (typeof URL === 'function') &&
      (typeof URL.createObjectURL === 'function')
    );

  },
};
