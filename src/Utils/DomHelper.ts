/**
 * Various utilies for DOM manipulation.
 */

import * as events from 'events';

/**
 * Checks if an element is valid for Player instanciation.
 *
 * @param acceptInstances Accept elements associated with Player instances.
 * @param element         Element to check.
 */
export const elementCheck: Function = (acceptInstances: boolean, element: HTMLElement): boolean => {
  if (
    (element.nodeName === 'AUDIO') &&
    (typeof element.getAttribute('data-icecast') === 'string') &&
    (element.getAttribute('data-icecast').toLowerCase() !== 'false') &&
    (acceptInstances || (!element.getAttribute('data-icecast-instance')))
  ) {
    return true;
  }
  return false;
};

/**
 * Get all audio players in DOM with a data-icecast (not 'false') attribute.
 */
export const getAudioElements: Function = (): HTMLAudioElement[] => {
  return [].slice.call(document.getElementsByTagName('audio'))
    .filter(elementCheck.bind(null, false));
};

/**
 * Watch for new audio players in DOM with a data-icecast (not 'false') attribute.
 *
 * @return Event emitter.
 *
 * @fires added   When a new non instanciated valid audio element is added to page.
 * @fires removed When a valid audio element (instanciated or not) is removed from page.
 */
export const watchAudioElements: Function = (): events.EventEmitter => {
  const emitter: events.EventEmitter = new events.EventEmitter();
  const observer: MutationObserver = new MutationObserver(
    (mutations: MutationRecord[]) => {
      for (const mutation of mutations) {
        for (
          const node
          of
          [].slice.call(mutation.addedNodes).filter(elementCheck.bind(null, false))
        ) {
          emitter.emit('added', (<HTMLAudioElement>node));
        }
        for (
          const node
          of
          [].slice.call(mutation.removedNodes).filter(elementCheck.bind(null, true))
        ) {
          emitter.emit('removed', (<HTMLAudioElement>node));
        }
      }
    },
  );

  observer.observe(
    document.body,
    {
      attributes: true,
      childList: true,
      subtree: true,
    },
  );
  return emitter;
};

/**
 * Checks if an element is valid for Player instanciation.
 *
 * @param acceptInstances Accept elements associated with Player instances.
 * @param element         Element to check.
 */
export const checkValidAudioElement: Function =
  (acceptInstances: boolean, element: HTMLElement): boolean =>
    elementCheck(acceptInstances, element);
