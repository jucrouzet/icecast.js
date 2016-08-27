import bluebird = require('bluebird');

import Logger = require('../Utils/Logger');
import Stream = require('./Stream');

/**
 * Type for storage of registered players.
 */
interface InstancesStorage {
  [key: string]: Player;
}
/**
 * Storage of registered players.
 */
const registeredPlayers: InstancesStorage = {};
/**
 * Type for source elements.
 */
interface SourceElement {
  src: string;
  mimeType: string;
}

/**
 * Player handling.
 */
class Player {
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
   * Stream urls.
   */
  // private urls: string[];

  /**
   * Constructor.
   *
   * @param audio <audio> DOM element to initialize player on.
   */
  constructor(audio: HTMLAudioElement) {
    if (audio.getAttribute('data-icecast-id')) {
      throw new Error('Audio element is already an Icecast.js instance');
    } else {
      this.id = Player.generateId();
      audio.setAttribute('data-icecast-id', this.id);
    }
    this.elem = audio;
    Logger.Trace('Initializing Icecast for for ', this.elem);
    if (
      this.elem.getAttribute('preload') &&
      (this.elem.getAttribute('preload') !== 'none')
    ) {
      Logger.Warn(
        this.elem,
        ' is set to preload data, this can creates bugs in Icecast.js'
      );
    }
    if (this.elem.getAttribute('autoplay') !== null) {
      Logger.Warn(
        this.elem,
        ' is set to autoplay, this can creates bugs in Icecast.js.' +
        'If you want to autoplay you stream, add the icecast-autoplay attribute.'
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
  private getSources(): SourceElement[] {
    const urls: SourceElement[] = [];

    if (this.elem.getAttribute('src')) {
      urls.push(<SourceElement>{ src: this.elem.getAttribute('src') });
    }
    [].slice.call(this.elem.querySelectorAll('SOURCE'))
      .filter((elem: HTMLSourceElement) => (!!elem.getAttribute('icecast-src')))
      .forEach((source: HTMLSourceElement) => (urls.push(<SourceElement>{
        src: source.getAttribute('icecast-src'),
        mimeType: source.getAttribute('mimeType') || undefined,
      })));
    return urls;
  }
  /**
   * Disable audio element while loading.
   */
  private disableAudio(): void {
    this.elem.setAttribute('icecast-src', this.elem.getAttribute('src'));
    this.elem.setAttribute('src', '');
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
  private load(): bluebird<void> {
    return bluebird.map(
      this.getSources(),
      (url: SourceElement) => {
        const stream: Stream = new Stream(url.src, url.mimeType);

        return stream.isValid()
          .then((): Stream => stream)
          .catch((err: any): void => {
            Logger.Info(`Cannot play "${url.src}": ${err.message || err}`);
            return undefined;
          });
      },
      { concurrency: 5 }
    )
      .then((results: any): Stream[] => results.filter(
        (result: any): boolean => result && result.mimeType)
      )
      .then((results: Stream[]): void => {
        /* tslint:disable: no-console */
        console.log(results);
        /* tslint:enable: no-console */
      });
  }

  /**
   * Registers a player instance.
   *
   * @param player Player instance
   */
  public static RegisterPlayer(player: Player): void {
    if (registeredPlayers[player.getId()]) {
      throw new Error('Player is already registered');
    }
    registeredPlayers[player.getId()] = player;
  }
  /**
   * Get a registered player instance.
   *
   * @param id Player's id.
   *
   * @return Player.
   */
  public static GetRegisteredPlayer(id: string): Player {
    if (!registeredPlayers[id]) {
      throw new Error('Player is not registered');
    }
    return registeredPlayers[id];
  }
  /**
   * Is player registered ?.
   *
   * @param id Player's id.
   *
   * @return True if already registered, false elsewhere.
   */
  public static IsRegisteredId(id: string): boolean {
    return !!registeredPlayers[id];
  }
  /**
   * Is player registered ?.
   *
   * @param player Player.
   *
   * @return True if already registered, false elsewhere.
   */
  public static IsRegisteredPlayer(player: Player): boolean {
    return !!(Object.keys(registeredPlayers).find(
      (key: string) => (registeredPlayers[key] === player)
    ));
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

export = Player;
