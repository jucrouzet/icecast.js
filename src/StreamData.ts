import {EventEmitter} from 'events';

import * as Consts from './constants';
import {logger} from './logger';
import {M3U} from './PlaylistParser/M3U';
import {APlaylistParser, IPlaylistStream} from './PlaylistParser/PlaylistParser';
import {XSPF} from './PlaylistParser/XSPF';
import * as Utils from './utils';

/**
 * Handled content types.
 */
enum PlaylistContentType {
    // M3U playlist
  M3UPlaylist = 1,
    // XPF playlist
  XPFPlaylist,
    // VCLT playlist
  VCLTPlaylist,
}

interface IWorkerMessage {
  // Message type.
  type: string; //tslint:disable-line: no-reserved-keywords
  // Headers messages argument.
  headers: IFetchResponseHeaders;
  // Data messages argument.
  data: ArrayBuffer;
  // Error message argument.
  error: string;
}

/**
 * Headers in WebWorker response.
 */
export interface IFetchResponseHeaders {
  [name: string]: string;
}

/**
 * Inlined worker.
 */
interface IInlineWorker {
  prototype: Worker;
  new(): Worker;
}
//tslint:disable: no-require-imports no-var-requires variable-name
const DownloadWorker: IInlineWorker = require('worker-loader?inline&fallback=false!./workers/streamRead');
//tslint:enable: no-require-imports no-any

/**
 * StreamData states.
 */
export enum State {
    // New object, no state yet.
  None = 0,
    // Parsing url to guess playlist/stream types.
  ParsingUrl,
    // Reading stream.
  Streaming,
    // Downloading stream stopped.
  Stopped,
    // Stream's data fetching failed, not recoverable.
  Fail,
}

/**
 * Class events.
 */
//tslint:disable: unified-signatures
export interface IStreamDataEmitter {
  // On new data.
  on(event: 'data', listener: (data: ArrayBuffer) => void): this;
  // On new mimeType.
  on(event: 'mimeType', listener: (mimetype: string) => void): this;
  // State change.
  on(event: 'state', listener: (state: State) => void): this;
  // On error.
  on(event: 'error', listener: (err: Error) => void): this;
}
//tslint:enable: unified-signatures

/**
 * Streams handler.
 */
export class StreamData extends EventEmitter implements IStreamDataEmitter {
  /**
   * Stream start timestamp.
   */
  private start: number;
  /**
   * Stream bytes downloaded so far.
   */
  private bytes: number;
  /**
   * Current download worker.
   */
  private dlWorker: Worker | void;
  /**
   * Logger.
   */
  private logger: Log;
  /**
   * Current state.
   */
  private state: State;
  /**
   * Original url.
   */
  private originalUrl: string;
  /**
   * Original url content-type.
   */
  private originalUrlType: PlaylistContentType | string;
  /**
   * Playlist content.
   */
  private playlistContent: string = '';
  /**
   * Playlist buffer.
   */
  private playlistBuffer: ArrayBuffer | void;
  /**
   * Streams url with score.
   */
  private streams: Map<string, number>;
  /**
   * Current mimetype.
   */
  private mimeType: string;

  /**
   * Constructor.
   */
  public constructor(url: string) {
    super();
    this.originalUrl = url;
    this.logger = logger(`StreamData[${url}]`);
    this.state = State.None;
    this.streams = new Map();
  }

  /**
   * Get mimetype's playability score.
   *
   * @return {number} From 0 to 1.
   */
  public static Playability(mimeType: string): number {
    return (MediaSource.isTypeSupported(mimeType)) ? 1 : 0;
  }

  /**
   * Analyze stream before reading it.
   */
  public async analyze(): Promise<void> {
    this.setState(State.ParsingUrl);
    this.setupWorker(this.originalUrl);
    return Promise.resolve();
  }

  /**
   * Write data.
   */
  public write(data: ArrayBuffer): void {
    this.bytes = this.bytes + data.byteLength;
    if (this.listeners('data').length > 0) {
      this.emit('data', data);
    }
  }

  /**
   * Get current buffer length.
   */
  public get bufferLength(): number {
    return (Utils.isUndefined(this.playlistBuffer)) ? 0 : (<ArrayBuffer>this.playlistBuffer).byteLength;
  }

  /**
   * Get current state.
   */
  public get currentState(): State {
    return this.state;
  }

  /**
   * Get current mime type.
   */
  public get currentMimeType(): string | void {
    return this.mimeType;
  }

  /**
   * Stop downloading stream if currently doing.
   */
  public stop(): void {
    if (!Utils.isUndefined(this.dlWorker)) {
      this.dlWorker.terminate();
      this.dlWorker = undefined;
    }
    this.setState(State.Stopped);
  }

  /**
   * Setup download worker and launch fetching.
   */
  private setupWorker(url: string): void {
    if (!Utils.isUndefined(this.dlWorker)) {
      this.dlWorker.terminate();
    }
    this.dlWorker = new DownloadWorker();
    this.dlWorker.addEventListener('message', (event: MessageEvent): void => {
      this.onWorkerMessage(event.data);
    });
    this.dlWorker.postMessage({type: 'start', url});
  }

  /**
   * On worker message.
   */
  private onWorkerMessage(data: IWorkerMessage): void { //tslint:disable-line: no-any
    if ((!Utils.isObject(data)) || (!Utils.isNotEmptyString(data.type))) {
      this.logger.warn('Unknown message from download worker', data);
      return;
    }
    switch (data.type) {
      case 'headers':
        this.onWorkerHeaders(data.headers);
        break;
      case 'data':
        this.onWorkerData(data.data);
        break;
      case 'end':
        this.onWorkerEnd();
        break;
      case 'error':
        this.onWorkerError(data.error);
        break;
      default:
        this.logger.warn('Unknown message type from download worker', data);
    }
  }

  /**
   * When receiving headers.
   */
  private onWorkerHeaders(headers: IFetchResponseHeaders): void {
    if (!Utils.isObject(headers)) {
      this.logger.warn('Invalid headers received', headers);
      return;
    }
    if (this.state !== State.ParsingUrl) {
      return;
    }
    if ((Utils.isUndefined(headers['content-type'])) || (headers['content-type'] === '')) {
      this.logger.warn('Stream has no content-type url, cannot use it');
      return;
    }

    const urlType: PlaylistContentType | string | null =
      this.guessContentType(headers['content-type']);

    if (urlType === null) {
      this.logger.warn(`Stream Content-Type [${headers['content-type']}] is not handled`);
      return;
    }
    if (Utils.isString(urlType)) {
      // @todo : Add url with description
      this.logger.warn('Using direct stream url is discouraged: http://bit.ly/2h4FEUX');
      this.setState(State.Streaming);
      this.setMimetype(urlType);
    }
    this.originalUrlType = urlType;
  }

  /**
   * When receiving new data.
   */
  private onWorkerData(data: ArrayBuffer): void {
    if (this.state === State.ParsingUrl) {
      this.bufferize(data);
      if (this.playlistContent.length > Consts.MAX_PLAYLIST_SIZE) {
        this.error('Playlist file exceeded maximum');
      }
    } else if (this.state === State.Streaming) {
      this.write(data);
    }
  }

  /**
   * When request ends.
   */
  private onWorkerEnd(): void {
    if (this.state === State.ParsingUrl) {
      let playlist: APlaylistParser;

      switch (this.originalUrlType) {
        case PlaylistContentType.M3UPlaylist:
          playlist = new M3U(this.getBufferAsString());
          break;
        case PlaylistContentType.VCLTPlaylist:
          this.error('VCLT playlist are not handled yet');
          return;
        case PlaylistContentType.XPFPlaylist:
          playlist = new XSPF(this.getBufferAsString());
          break;
        default:
          this.error('Stream ended before streaming');
          return;
      }
      playlist.parse()
        .then((streams: IPlaylistStream[]) => {
          this.logger.warn(streams);
        })
        .catch((err: Error) => { this.error(err); });
    }
  }

  /**
   * On worker error.
   */
  private onWorkerError(reason: string): void {
    this.error(reason);
  }

  /**
   * Guess contentype from Content-Type header or null if not handled.
   */
  private guessContentType(headerValue: string): PlaylistContentType | string | null {
    const typeToEnum: [RegExp, PlaylistContentType][] = [
      [/application\/x-mpegURL/i, PlaylistContentType.M3UPlaylist],
      [/audio\/x-mpegurl/i, PlaylistContentType.M3UPlaylist],
      [/application\/xspf(\+xml)?/i, PlaylistContentType.XPFPlaylist],
      [/audio\/x-vclt/i, PlaylistContentType.VCLTPlaylist],
    ];
    for (const [regex, type] of typeToEnum) {
      if (regex.test(headerValue)) {
        return type;
      }
    }
    if (MediaSource.isTypeSupported(headerValue)) {
      return headerValue;
    }
    return null;
  }

  /**
   * Set state.
   */
  private setState(state: State): void {
    if (state !== this.state) {
      this.state = state;
      this.emit('state', state);
      if (state === State.Streaming) {
        this.start = Date.now();
        this.bytes = 0;
      }
    }
  }

  /**
   * Set mimetype.
   */
  private setMimetype(mimeType: string): void {
    if (mimeType !== this.mimeType) {
      this.mimeType = mimeType;
      this.emit('mimeType', mimeType);
    }
  }

  /**
   * Emit an error.
   */
  private error(err: Error | string, unrecoverable: boolean = false): void {
    if (!(err instanceof Error)) {
      err = new Error(err);
    }
    this.emit('error', err);
    if (unrecoverable) {
      this.setState(State.Fail);
      if (!Utils.isUndefined(this.dlWorker)) {
        this.dlWorker.terminate();
        this.dlWorker = undefined;
      }
    }
  }

  /**
   * Append data to buffer.
   */
  private bufferize(buffer: ArrayBuffer): void {
    if (buffer.byteLength === 0) {
      return;
    }

    const newBuff: Uint8Array = new Uint8Array(this.bufferLength + buffer.byteLength);

    if (!Utils.isUndefined(this.playlistBuffer)) {
      newBuff.set(new Uint8Array(this.playlistBuffer), 0);
    }
    newBuff.set(new Uint8Array(buffer), this.bufferLength);
    this.playlistBuffer = newBuff.buffer;
    return;
  }

  /**
   * Get current buffer as string.
   */
  private getBufferAsString(): string {
    if ((Utils.isUndefined(this.playlistBuffer)) || (this.playlistBuffer.byteLength === 0)) {
      return '';
    }

    let content: string = '';

    try {
      content = String.fromCharCode.apply(null, new Uint8Array(this.playlistBuffer));
    } catch (err) {
      this.error(err);
      content = '';
    } finally {
      this.playlistBuffer = undefined;
    }
    return content;
  }
}
