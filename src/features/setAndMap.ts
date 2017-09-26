import { IFeature } from './IFeature';

/**
 * Test if Set and Map are available.
 */
export const setAndMap: IFeature = {
  name: 'Sets and Maps',
  test: (): boolean => {
    return (
      (typeof Set === 'function') &&
      (typeof Map === 'function')
    );
  },
};
