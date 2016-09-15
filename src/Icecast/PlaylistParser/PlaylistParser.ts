import {PlaylistStream} from './PlaylistStream';

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
  protected streams: PlaylistStream[];

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
  public getStreams(): PlaylistStream[] {
    return this.streams;
  }

  /**
   * Parses playlist.
   */
  public abstract parse(): Promise<PlaylistStream[]>;

  /**
   * Generate a default stream with empty data for non EXTM3U streams.
   */
  protected static CreateDefaultStream(): PlaylistStream {
    return {
      title    : '',
      duration : -1,
      description : '',
      metas    : {},
      streamUrl: '',
    };
  }
}
