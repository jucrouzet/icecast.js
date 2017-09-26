import {EventEmitter} from 'events';

import * as Consts from './constants';
import {logger} from './logger';
import {State as DataState, StreamData} from './StreamData';
import * as Utils from './utils';

//tslint:disable: unified-signatures
export interface ISourceEventEmitter {
  // On error.
  on(event: 'error', listener: (err: Error) => void): this;
  // When a valid stream is discovered.
  on(event: 'isPlayable', listener: () => void): this;
}
//tslint:enable: unified-signatures

/**
 * MediaSource handler for Icecast streams.
 */
export class Source extends EventEmitter implements ISourceEventEmitter {
  /**
   * HTMLAudioElement the source is for.
   */
  private audioElem: HTMLAudioElement;
  /**
   * Stream/Playlist urls.
   */
  private urls: Set<URL> = new Set();
  /**
   * MediaSource object.
   */
  private mediaSource: MediaSource;
  /**
   * Source buffer.
   */
  private sourceBuffer: SourceBuffer;
  /**
   * Queued chunks waiting to be buffered.
   */
  private queuedChunks: Set<ArrayBuffer>;
  /**
   * Logger.
   */
  private logger: Log = logger('Source');
  /**
   * StreamData instance.
   */
  private streamData: StreamData;

  /**
   * Constructor.
   */
  public constructor(audioElem: HTMLAudioElement, urls: string[]) {
    super();
    this.audioElem = audioElem;
    this.mediaSource = new MediaSource();
    this.queuedChunks = new Set();
    for (const url of urls) {
      try {
        this.urls.add(new URL(url, window.document.location.toString()));
      } catch (err) {
        this.logger.warn(`Ignoring source url "${url}": ${err}`);
      }
    }
    this.mediaSource.addEventListener('sourceopen', () => { this.onOpen(); });
    window.setTimeout(
      () => { this.discoverStreams(); },
      1,
    );
  }

  /**
   * Get url for audio tag.
   */
  public get source(): string {
    return window.URL.createObjectURL(this.mediaSource);
  }

  /**
   * Stop downloading stream.
   */
  public stopStream(): void {
    if (
      (Utils.isUndefined(this.streamData)) ||
      this.streamData.currentState !== DataState.Streaming
    ) {
      return;
    }
    this.queuedChunks.clear();
    this.streamData.stop();
    this.sourceBuffer.remove(
      this.sourceBuffer.buffered.start(0),
      this.sourceBuffer.buffered.end(0),
    );
  }

  /**
   * On source opened.
   */
  private onOpen(): void {
    this.logger.debug('MediaSource opened');
    return;
  }

  /**
   * Start discovering streams.
   */
  private discoverStreams(): void {
    if (this.urls.size === 0) {
      this.emit('error', new Error('No playable streams/playlist'));
      return;
    }

    const url: URL = Array.from(this.urls.values())[0];

    this.tryUrl(url)
      .then((streamData: StreamData) => {
        this.logger.debug(`Choosing stream "${url.toString()}`);
        this.streamData = streamData;
        this.emit('isPlayable');
        this.bindStreamData();
      })
      .catch((err: Error) => {
        this.logger.warn(`Stream/Playlist "${url}" cannot be played: ${err}`);
        this.urls.delete(url);
        if (this.urls.size > 0) {
          this.discoverStreams();
          return;
        }
        this.emit('error', new Error('No playable streams/playlist'));
      });
  }

  /**
   * Try a stream/playlist url and returns its stream url if playable.
   */
  private async tryUrl(url: URL): Promise<StreamData> {
    const streamData: StreamData = new StreamData(url.toString());

    return streamData.analyze().then((): StreamData => streamData);
  }

  /**
   * Bind stream data events to buffer.
   */
  private bindStreamData(): void {
    if (Utils.isUndefined(this.streamData)) {
      throw new Error('Binding undefined stream data');
    }

    const doBind: Function = (): void => {
      this.streamData.on('data', (data: ArrayBuffer) => {
        this.addChunk(data);
      });
      if (!Utils.isUndefined(this.streamData.currentMimeType)) {
        this.buildBuffer(this.streamData.currentMimeType);
      }
      this.streamData.on('mimeType', (mimeType: string) => {
        this.buildBuffer(mimeType);
      });
    };

    if (this.streamData.currentState === DataState.Streaming) {
      doBind();
    } else {
      this.streamData.on('state', (state: DataState) => {
        if (this.streamData.currentState === DataState.Streaming) {
          doBind();
        }
      });
    }
  }

  /**
   * Build a new buffer.
   */
  private buildBuffer(mimeType: string): void {
    if (!Utils.isUndefined(this.sourceBuffer)) {
      this.mediaSource.removeSourceBuffer(this.sourceBuffer);
      delete this.sourceBuffer;
    }
    (<any>window).ll = this.mediaSource; //tslint:disable-line: no-any
    this.sourceBuffer = this.mediaSource.addSourceBuffer(mimeType);
    this.sourceBuffer.timestampOffset = 0;
    this.sourceBuffer.addEventListener('updateend', (): void => {
      this.checkBufferLength();
      if (this.queuedChunks.size > 0) {
        this.addChunk(this.queuedChunks.values().next().value, true);
      }
    });
  }

  /**
   * Add a chunk to sourceBuffer or queue it if already updating (and not already queued).
   */
  private addChunk(data: ArrayBuffer, queuedChunk: boolean = false): void {
    if (
      (Utils.isUndefined(this.sourceBuffer)) ||
      (this.mediaSource.readyState !== 'open')
    ) {
      return;
    }
    if (this.sourceBuffer.updating) {
      if (queuedChunk) {
        return;
      }
      this.queuedChunks.add(data);
      return;
    }
    this.sourceBuffer.appendBuffer(data);
    if (queuedChunk) {
      this.queuedChunks.delete(data);
    }
  }

  /**
   * Stop downloading stream if the buffer is too big.
   */
  private checkBufferLength(): void {
    if (
      (Utils.isUndefined(this.sourceBuffer)) ||
      (this.sourceBuffer.buffered.length < 1)
    ) {
      return;
    }
    if (
      (
        (
          this.sourceBuffer.buffered.end(0) -
          this.audioElem.currentTime
        ) > Consts.BUFFER_MAX_LENGTH
      )
    ) {
      this.logger.info(`Buffer has reached ${Consts.BUFFER_MAX_LENGTH} seconds, stopping stream`);
      this.stopStream();
    }
  }

}
