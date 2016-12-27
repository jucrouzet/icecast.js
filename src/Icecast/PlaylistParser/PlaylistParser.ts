import {IPlaylistStream} from './PlaylistStream';

import * as Promise from 'bluebird';

/**
 * Playlist parsers base class.
 */
export abstract class PlaylistParser {
  /**
   * Playlist file content.
   */
  protected content: string;
  /**
   * Playlist's streams.
   */
  protected streams: IPlaylistStream[];

  /**
   * Constructor.
   *
   * @param data Playlist file data.
   */
  constructor(data: string) {
    if (!data) {
      throw new Error('Empty playlist file');
    }
    this.content = data;
    this.streams = [];
  }

  /**
   * Get playlist streams.
   */
  public getStreams(): IPlaylistStream[] {
    return this.streams;
  }

  /**
   * Parses playlist.
   */
  public abstract parse(): Promise<IPlaylistStream[]>;

  /**
   * Generate a default stream with empty data for non EXTM3U streams.
   */
  protected static createDefaultStream(): IPlaylistStream {
    return {
      title    : '',
      duration : -1,
      description : '',
      metas    : {},
      streamUrl: '',
    };
  }
}
