import { IFeature } from './IFeature';

/**
 * Test if AudioTags are supported.
 */
export const audio: IFeature = {
  name: '<audio> tag support',
  test: (): boolean => {
    return (typeof HTMLAudioElement === 'function');
  },
};
