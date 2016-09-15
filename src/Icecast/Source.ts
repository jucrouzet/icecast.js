import {PlaylistParser} from './PlaylistParser/PlaylistParser';
import {PlaylistStream} from './PlaylistParser/PlaylistStream';


import Path = require('path');
import Url = require('url');
import bufferLib = require('buffer');
import Bluebird = require('bluebird');

import Logger = require('../Utils/Logger');
import M3U = require('./PlaylistParser/M3U');
import XSPF = require('./PlaylistParser/XSPF');

const nodeBuffer = bufferLib.Buffer;


/**
 * Streams and playlists handling.
 */
class Source {
  /**
   * Source url.
   */
  private url: string;
  /**
   * Audio streams.
   */
  private streams: PlaylistStream[];
  /**
   * Playlist file mimetype.
   */
  private playlistMimeType: string;

  /**
   * A map of mimeType => method for playlist parsers.
   */
  private static playlistTypes: string[] = [
    'application/xspf+xml',
    'audio/x-mpegurl',
    'application/vnd.apple.mpegurl',
  ];

  /**
   * Constructor.
   *
   * @param url        Stream url.
   * @param [mimeType] Stream's mimetype.
   */
  constructor(url: string, mimeType?: string) {
    const parts: string[] | void = mimeType && mimeType.split(/\s*;/);

    this.url = url;
    if (
      parts &&
      Array.isArray(parts) &&
      (Source.playlistTypes.indexOf(parts[0].toLowerCase()) !== -1)
    ) {
      this.playlistMimeType = parts[0].toLowerCase();
      return;
    }

    const guessedMimetype = Source.guessMimeTypeByExtension(url);

    if (guessedMimetype && (Source.playlistTypes.indexOf(guessedMimetype) !== -1)) {
      this.playlistMimeType = guessedMimetype;
    }
  }

  /**
   * Parse source (playlist or stream).
   */
  public load(): Bluebird<void> {
    let promise: Bluebird<any> = Bluebird.resolve();
    const audio = new Audio();

    if (this.playlistMimeType && (Source.playlistTypes.indexOf(this.playlistMimeType) !== -1)) {
      promise = Bluebird.resolve(this.parsePlaylist())
        .timeout(1000)
        .then((streams: PlaylistStream[]): PlaylistStream[] => {
          let parsedStreams: PlaylistStream[];

          streams.forEach((stream: PlaylistStream) => {
            if (stream.mimeType) {
              switch (audio.canPlayType(stream.mimeType)) {
                case 'probably':
                  stream.score = 1;
                  break;
                case 'maybe':
                  stream.score = 0.8;
                  break;
                default:
                  stream.score = -1;
              }
            } else {
              stream.score = 0.7;
            }
          });
          parsedStreams = streams.filter((stream: PlaylistStream) => (stream.score > 0));
          if (!parsedStreams.length) {
            throw new Error('No playable stream found in playlist');
          }
          return parsedStreams;
        });
    }
    return promise.then((streams: (PlaylistStream[] | void)): PlaylistStream[] => {
      if (streams) {
        return (<PlaylistStream[]>streams);
      }
      const builtStream: PlaylistStream = (<PlaylistStream>{ streamUrl: this.url });

      if (this.mimeType) {
        switch (audio.canPlayType(this.mimeType)) {
          case 'probably':
            builtStream.score = 0.6;
            break;
          case 'maybe':
            builtStream.score = 0.5;
            break;
          default:
            throw new Error(`Browser cannot read a ${this.mimeType} streams / playlist`);
        }
        builtStream.mimeType = this.mimeType;
      } else {
        Logger.Info(
          `${this.url} will be considered as an audio stream as no ` +
          ' type attribute has been set and type cannot be guessed from extension'
        );
        builtStream.score = 0.1;
      }
      return [builtStream];
    })
      .then((streams: PlaylistStream[]): void => {
        this.streams = streams.sort((a: PlaylistStream, b: PlaylistStream): number => {
          return ((a.score || 0) - (b.score || 0));
        });
      })
      .catch(Bluebird.TimeoutError, () => {
        throw new Error('Timeout while fetching playlist');
      });
  }
  /**
   * Get source mimeType.
   */
  public get mimeType(): string {
    return this.playlistMimeType;
  }
  /**
   * Get source's streams.
   */
  public getStreams(): PlaylistStream[] {
    return this.streams;
  }

  /**
   * Parses stream's playlist file.
   */
  private parsePlaylist(): Promise<PlaylistStream[]> {

    return window.fetch(
      this.url,
      {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-cache',
        referrer: window.document && window.document.location && window.document.location.href,
      }
    )
      .then((response: Response): Promise<PlaylistStream[]> => {
        let parser: PlaylistParser;

        return response.arrayBuffer()
          .then((body: ArrayBuffer): Promise<PlaylistStream[]> => {
            const buffer: Buffer = nodeBuffer.from(body);
            const text: string =  buffer.toString('utf-8');

            switch (this.playlistMimeType) {
              case 'application/xspf+xml' :
                parser = new XSPF(text);
                break;
              case 'audio/x-mpegurl' :
              case 'application/vnd.apple.mpegurl' :
                parser = new M3U(text);
                break;
              default:
                throw new Error('Unknown playlist type');
            }
            return parser.parse();
          });
      });
  }

  /**
   * Tries to guess the mimetype with the extension in url.
   *
   * @param givenUrl Url to parse.
   *
   * @return Mimetype or empty string if could not guess.
   */
  private static guessMimeTypeByExtension(givenUrl: string): string {
    let mime: string = '';

    if (!givenUrl) {
      return mime;
    }
    const urlObj = Url.parse(givenUrl);

    if (!urlObj || !urlObj.pathname) {
      return mime;
    }
    switch (Path.extname(urlObj.pathname).toLowerCase()) {
      case '.xspf' :
        mime = 'application/xspf+xml';
        break;
      case '.m3u' :
      case '.m3u8' :
        mime = 'audio/x-mpegurl';
        break;
      case '.mp3' :
        mime = 'audio/mpeg';
        break;
      case '.aac' :
        mime = 'audio/aac';
        break;
      case '.ogg' :
        mime = 'audio/ogg';
        break;
      default:
        return mime;
    }
    Logger.Debug(
      `Guessed that ${givenUrl} is a ${mime}, that may be wrong,` +
      'you should add a type attribute if it\'s from an audio/source tag'
    );
    return mime;
  }
}

export = Source;
