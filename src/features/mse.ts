import { IFeature } from './IFeature';

/**
 * Test if Media Source Extension is available.
 */
export const mse: IFeature = {
  name: 'Media Source Extension API',
  test: (): boolean => {
    return (typeof MediaSource === 'function');
  },
};
