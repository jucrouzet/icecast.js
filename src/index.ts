/**
 * Entry point.
 */

import {check as featureCheck} from './features/Check';
import {logger} from './logger';
import {Player} from './Player';

let bootstrapped: boolean = false;

/**
 * Bootstrap Icecast.js on current players and future ones.
 */
function bootstrap(): void {
  if (
    (window === undefined) ||
    (document === undefined) ||
    bootstrapped
  ) {
    return;
  }
  bootstrapped = true;

  logger().info('Bootstrapping Icecast.js');

  logger().debug('Detecting mandatory browser features');
  if (!featureCheck()) {
    return;
  }

  logger().debug('Applying icecast.js to current players');
  Array.from(document.getElementsByTagName('audio')).forEach((elem: Element) => {
    if (elem.classList.contains('icecast.js')) {
      (new Player(<HTMLAudioElement>elem)).init(); //tslint:disable-line: no-unused-expression
    }
  });

  logger().debug('Setting observer for future players');
  // create an observer instance
  const observer: MutationObserver = new MutationObserver((mutations: MutationRecord[]): void => {
    mutations.forEach((mutation: MutationRecord) => {
      Array.from(mutation.addedNodes).forEach((node: Node) => {
        if (
          (node.nodeName === 'AUDIO') &&
          (
            (node.attributes
              .getNamedItem('class').value
              .split(/\s+/)
              .indexOf('icecast.js')
            )
            !== -1
          )
        ) {
          const player: Player = new Player(<HTMLAudioElement>node);

          player.init();
        }
      });
    });
  });
  observer.observe(
    document.getElementsByTagName('body')[0],
    {
      attributes: false,
      characterData: false,
      childList: true,
      subtree: true,
    },
  );
}

if (window.bootstrapIcecastJSOnLoad) {
  if (document.readyState === 'complete') {
    setTimeout(bootstrap, 1);
  } else {
    window.addEventListener(
      'DOMContentLoaded',
      () => {
        bootstrap();
      },
      false,
    );
    window.addEventListener(
      'load',
      () => {
        bootstrap();
      },
      false,
    );
  }
}
export {
  bootstrap,
  Player,
};
