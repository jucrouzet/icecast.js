import { IFeature } from './IFeature';

/**
 * Test if Mutation Observer API is available.
 */
export const mutationObservers: IFeature = {
  name: 'Mutation Observer API',
  test: (): boolean => {
    return (typeof MutationObserver === 'function');
  },
};
