import * as DomHelper from '../Utils/DomHelper';
import { Logger }  from '../Utils/Logger';
import { Source } from './Source';

import * as Promise from 'bluebird';

/**
 * Type for source elements.
 */
interface ISourceElement {
  /**
   * Source's url.
   */
  src: string;
  /**
   * Source's mimetype.
   */
  mimeType?: string;
}

/**
 * Player handling.
 */
export class Player {
  /**
   * Audio tag element.
   */
  private elem: HTMLAudioElement;
  /**
   * Audio tag id.
   */
  private id: string;
  /**
   * Audio should autoplay.
   */
  private autoplay: boolean = false;
  /**
   * Ready sources.
   */
  private sources: Source[];

  /**
   * Constructor.
   *
   * @param audio <audio> DOM element to initialize player on.
   */
  constructor(audio: HTMLAudioElement) {
    if (!DomHelper.checkValidAudioElement(true, audio)) {
      throw new Error('Provided argument is not a valid audio element');
    }
    if (audio.getAttribute('data-icecast-id')) {
      throw new Error('Audio element is already an Icecast.js instance');
    } else {
      this.id = Player.generateId();
      audio.setAttribute('data-icecast-id', this.id);
    }
    this.elem = audio;
    Logger.send.log('Initializing Icecast for for ', this.elem);
    if (
      this.elem.getAttribute('preload') &&
      (this.elem.getAttribute('preload') !== 'none')
    ) {
      Logger.send.warn(
        this.elem,
        ' is set to preload data, this can creates bugs in Icecast.js',
      );
    }
    if (this.elem.getAttribute('autoplay') !== null) {
      Logger.send.warn(
        this.elem,
        ' is set to autoplay, this can creates bugs in Icecast.js.' +
        'If you want to autoplay you stream, add the icecast-autoplay attribute.',
      );
      this.autoplay = true;
    }
    if (this.elem.getAttribute('icecast-autoplay') !== null) {
      this.autoplay = true;
    }
    this.disableAudio();
    this.load();
  }

  /**
   * Get player's unique id.
   *
   * @return Id.
   */
  public getId(): string {
    return this.id;
  }

  /**
   * Get player's streams in source or tag.
   */
  private getSources(): ISourceElement[] {
    const urls: ISourceElement[] = [];

    if (this.elem.getAttribute('src')) {
      urls.push(<ISourceElement>{
        src: this.elem.getAttribute('src'),
        mimeType: this.elem.getAttribute('type') || undefined,
      });
    }
    [].slice.call(this.elem.querySelectorAll('SOURCE'))
      .filter((elem: HTMLSourceElement) => (!!elem.getAttribute('icecast-src')))
      .forEach((source: HTMLSourceElement) => (urls.push(<ISourceElement>{
        src: source.getAttribute('icecast-src'),
        mimeType: source.getAttribute('type') || undefined,
      })));
    return urls;
  }
  /**
   * Disable audio element while loading.
   */
  private disableAudio(): void {
    if (this.elem.getAttribute('src')) {
      this.elem.setAttribute('icecast-src', this.elem.getAttribute('src'));
      this.elem.setAttribute('src', '');
    }
    [].slice.call(this.elem.querySelectorAll('SOURCE'))
      .forEach((source: HTMLSourceElement) => {
        source.setAttribute('icecast-src', source.getAttribute('src'));
        source.removeAttribute('src');
      });
    this.elem.pause();
  }
  /**
   * Try to load streams.
   */
  private load(): Promise<void> {
    return Promise.map(
      this.getSources(),
      (url: ISourceElement): Promise<Source | void> => {
        const source: Source = new Source(url.src, url.mimeType);

        return source.load()
          .then((): Source => source)
          .catch((err: Error): void => {
            Logger.send.info(`Cannot play "${url.src}": ${err.message || err}`);
            return undefined;
          });
      },
      { concurrency: 5 },
    )
      .then((results: Source[]): Source[] => results.filter((result: Source): boolean => !!result))
      .then((results: Source[]): void => {
        if (!results.length) {
          throw new Error('No playable source defined for player');
        }
        this.sources = results;
      });
  }

  /**
   * Generate a random id attribute value for <audio> element.
   *
   * @return The id attribute value.
   */
  private static generateId(): string {
    let id: string = 'icecast_';

    for (let i = 0; i < 10; i += 1) {
      id += String.fromCharCode(97 + Math.floor(Math.random() * 25));
    }
    return id;
  }
}
