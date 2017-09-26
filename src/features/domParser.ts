import { IFeature } from './IFeature';

/**
 * Test if DOMParser is supported.
 */
export const domParser: IFeature = {
  name: 'DOM Parsing',
  test: (): boolean => {
    return (typeof DOMParser === 'function');
  },
};
