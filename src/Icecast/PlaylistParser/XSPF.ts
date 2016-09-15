import {PlaylistParser} from './PlaylistParser';
import {PlaylistStream} from './PlaylistStream';

import Logger = require('../../Utils/Logger');
import Utils = require('../../Utils/Various');

/**
 * XSPF files parser.
 */
class XSPF extends PlaylistParser {
  /**
   * Constructor.
   *
   * @param data Playlist file data.
   */
  constructor(data: string) {
    super(data);
  }

  /**
   * Tries to parse stream.
   *
   * @return A promise resolved when parsing is done.
   */
  public parse(): Promise<PlaylistStream[]> {
    return new Promise((resolve: Function, reject: Function): void => {
      const parser: DOMParser = new DOMParser();
      const doc: Document = parser.parseFromString(this.content, 'application/xml');

      if (doc.getElementsByTagName('parsererror').length) {
        return reject(new Error('XML error'));
      }
      this.streams = this.parsePlaylist(doc);
      if (!this.streams.length) {
        return reject(new Error('No streams found'));
      }
      return resolve(this.streams);
    });
  }

  /**
   * Extract streams from the <playlist> tags.
   *
   * @param doc Parsed playlist document.
   */
  private parsePlaylist(doc: Document): PlaylistStream[] {
    const playlists: NodeList = doc.getElementsByTagName('playlist');
    let streams: PlaylistStream[] = [];

    [].slice.call(playlists).forEach((playlist: Element): void => {
      let trackList: Element;
      let defaultTitle: string = '';

      [].slice.call(playlist.childNodes).forEach((child: Element): void => {
        if (child.tagName === 'title') {
          defaultTitle = child.textContent;
        }
        if (child.tagName === 'trackList') {
          trackList = child;
        }
      });
      if (trackList) {
        streams = streams.concat(this.parseTrackList(trackList, defaultTitle));
      }
    });
    Logger.Debug(streams);
    return streams;
  }
  /**
   * Extract streams from the <trackList> tags.
   *
   * @param trackList    <trackList> to parse.
   * @param defaultTitle Default stream title.
   */
  private parseTrackList(trackList: Element, defaultTitle: string): PlaylistStream[] {
    const streams: PlaylistStream[] = [];

    [].slice.call(trackList.getElementsByTagName('track')).forEach((track: Element): void => {
      const stream: PlaylistStream = PlaylistParser.CreateDefaultStream();
      let url: string = '';
      let title: string = defaultTitle;
      let metas: any = {};
      let description: string = '';
      let duration: number = -1;

      [].slice.call(track.childNodes).forEach((child: Element): void => {
        if (child.tagName === 'title' && child.textContent) {
          title = child.textContent;
        }
        if (child.tagName === 'location' && child.textContent) {
          const value = child.textContent.trim().toLocaleLowerCase();

          if (!value.match(/^https?:\/\//i)) {
            Logger.Debug(`Ignoring non http-stream : ${value}`);
            return;
          }
          url = value;
        }
        if (child.tagName === 'annotation' && child.textContent) {
          metas = this.extractMetasFromAnnotation(child.textContent.trim());
        }
        if (child.tagName === 'info' && child.textContent) {
          description = child.textContent;
        }
        if (child.tagName === 'duration' && child.textContent) {
          const value = parseInt(child.textContent, 10);

          duration = isNaN(value) ? -1 : (value / 1000);
        }
      });
      if (!url) {
        Logger.Debug('Skipping streamless track : ', track);
        return;
      }
      stream.title = title;
      stream.description = description;
      stream.duration = duration;
      stream.streamUrl = url;
      stream.metas = metas;
      if (metas.bitrate && (typeof metas.bitrate === 'number')) {
        stream.bitrate = metas.bitrate;
      }
      if (metas.contentType) {
        stream.mimeType = metas.contentType;
      }
      if (!stream.description && metas.streamDescription) {
        stream.description = metas.description;
      }
      streams.push(stream);
    });
    return streams;
  }
  /**
   * Extract metas from Icecast formatted annotation tag.
   *
   * @param content Tag content.
   */
  private extractMetasFromAnnotation(content: string): any {
    const metas: any = {};

    content.split(/[\r\n]+/).forEach((line: string): void => {
      if (line.indexOf(':') !== -1) {
        const parts = line.split(':');

        metas[Utils.Camelize(parts[0].trim())] = parts.slice(1).join(':').trim();
      }
    });
    return metas;
  }
}

export = XSPF;
