/**
 * Stream datas.
 */
export interface IPlaylistStream {
  streamUrl: string;
  score?: number;
  title?: string;
  description?: string;
  duration?: number;
  metas?: {};
  mimeType?: string;
  bitrate?: number;
}

/**
 * Playlist parsers base class.
 */
export abstract class APlaylistParser {
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
    if (data.length === 0) {
      throw new Error('Empty playlist file');
    }
    this.content = data;
    this.streams = [];
  }

  /**
   * Generate a default stream with empty data for non EXTM3U streams.
   */
  protected static createDefaultStream(): IPlaylistStream {
    return {
      title      : '',
      duration   : -1,
      description: '',
      metas      : {},
      streamUrl  : '',
    };
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

}
