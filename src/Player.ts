import {EventEmitter} from 'events';

import {logger} from './logger';
import {Source} from './Source';
import * as Utils from './utils';

/**
 * Player class.
 */
export class Player extends EventEmitter {
  /**
   * Dom element (<audio>).
   */
  private element: HTMLAudioElement;
  /**
   * Logger.
   */
  private logger: Log = logger('Player');
  /**
   * Player is autoplay.
   */
  private autoplay: boolean = false;
  /**
   * Stream urls.
   */
  private urls: string[] = [];
  /**
   * Source object.
   */
  private source: Source;
  /**
   * Current time.
   */
  private currentTime: number = 0;

  public constructor(elem: HTMLAudioElement) {
    super();
    if (
      (typeof elem !== 'object') ||
      (typeof elem.tagName !== 'string') ||
      (elem.tagName !== 'AUDIO')
    ) {
      throw new Error('Instantiating a Player needs a valid <audio> element');
    }
    if (elem.classList.contains('icecastjs-player')) {
      throw new Error(`Trying to re-instantiate Icecast.js on ${elem}`);
    }
    elem.classList.add('icecastjs-player');
    this.logger.debug('Creating a new instance of player for ', elem);
    this.element = elem;
  }

  /**
   * Init player.
   */
  public init(): void {
    this.ensureNotPlaying();
    this.getSourcesFromElement();
    this.readIcecastAttributes();
    this.disableSeek();
    this.source = new Source(this.element, this.urls);
    this.source.on('isPlayable', (): void => {
      this.element.src = this.source.source;
      if (this.autoplay) {
        const playResult: Promise<void> | void = this.element.play();

        if (!Utils.isUndefined(playResult)) {
          playResult.catch((err: Error) => {
            this.setError(err);
          });
        }
        return ;
      }
      this.source.stopStream();
    });
    this.source.on('error', (err: Error): void => {
      this.setError(err);
    });
  }

  /**
   * Bind player class to element.
   */
  public bind(): void {
    return;
  }

  /**
   * Unbind player class to element.
   */
  public unbind(): void {
    return;
  }

  /**
   * Get stream urls from element.
   */
  private getSourcesFromElement(): void {
    if (this.element.src !== '') {
      this.urls.push(this.element.src);
      this.element.attributes.removeNamedItem('src');
    }
    for (const source of Array.from(this.element.getElementsByTagName('SOURCE'))) {
      if ((<HTMLSourceElement>source).src !== '') {
        this.urls.push((<HTMLSourceElement>source).src);
      }
      (<Node>source.parentNode).removeChild(source);
    }
    this.element.load();
  }

  /**
   * Ensure that player is not already playing or loading.
   */
  private ensureNotPlaying(): void {
    // If already playing, pause it.
    if (!this.element.paused) {
      this.logger.warn(
        'Player ',
        this.element,
        ' was already playing',
      );
      this.element.pause();
    }
    // Detect if autoplay, remove the native one and save it
    if (
      this.element.autoplay ||
      (this.element.attributes.getNamedItem('autoplay') !== null)
    ) {
      this.logger.warn(
        'Player ',
        this.element,
        ' was set on autoplay, use "icecast-autoplay" instead, see http://bit.ly/2jsFBqz',
      );
      this.element.autoplay = false;
      this.autoplay = true;
    }
    // Detect if preload, unset it
    if (this.element.preload !== 'none') {
      this.logger.warn(
        'Player ',
        this.element,
        ' was not set on preload="none"',
      );
      this.element.preload = 'none';
    }
  }

  /**
   * Read the icecast custom attributes.
   */
  private readIcecastAttributes(): void {
    if (this.element.attributes.getNamedItem('icecast-autoplay') !== null) {
      this.autoplay = true;

    }
  }

  /**
   * Set player on error.
   */
  private setError(err: Error | string): void {
    this.logger.warn('Player ', this.element, ' is disabled :', err);
    if (this.element.attributes.getNamedItem('src') !== null) {
      this.element.attributes.removeNamedItem('src');
      this.element.load();
    }
  }

  /**
   * Disable native seek.
   */
  private disableSeek(): void {
    this.element.addEventListener('timeupdate', (): void => {
      if (!this.element.seeking) {
        this.currentTime = this.element.currentTime;
      }
    });
    this.element.addEventListener('seeking', (): void => {
      const delta: number = this.element.currentTime - this.currentTime;

      if (Math.abs(delta) > 0.01) {
        this.logger.info('Prevented seeking');
        this.element.currentTime = this.currentTime;
      }
    });

    this.element.addEventListener('ended', (): void => {
      this.currentTime = 0;
    });
  }
}
