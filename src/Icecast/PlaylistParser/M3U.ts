import { Logger } from '../../Utils/Logger';
import { PlaylistParser } from './PlaylistParser';
import { IPlaylistStream } from './PlaylistStream';

import * as Promise from 'bluebird';

/**
 * M3U(8) files parser.
 */
export class M3U extends PlaylistParser {
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
  public parse(): Promise<IPlaylistStream[]> {
    return new Promise<IPlaylistStream[]>((resolve: Function, reject: Function): void => {
      let currentStream: IPlaylistStream;
      const lines: string[] = this.content.split(/[\r\n]+/);
      const extInfRegex: RegExp = /^\s*#EXTINF\s*:\s*(\-?\d+)(.*),(.*)$/i;

      lines.forEach((rawLine: string): void => {
        const line = rawLine.trim();

        if (!line || line.match(/^\s*#(?!EXTINF)/i)) {
          return;
        }
        if (line.match(extInfRegex)) {
          const [, duration, metas, title] = extInfRegex.exec(line);

          currentStream = this.parseInfos(title, duration, metas);
          return;
        }
        if (!line.match(/^https?:\/\//i)) {
          Logger.send.debug(`Ignoring stream "${line}" (not http(s))`);
        }
        if (!currentStream) {
         PlaylistParser.createDefaultStream();
        }
        currentStream.streamUrl = line;
        this.streams.push(currentStream);
        currentStream = undefined;
      });
      if (!this.streams.length) {
        return reject(new Error('No streams found'));
      }
      return resolve(this.streams);
    });
  }

  /**
   * Parse grepped data from #EXTINF.
   *
   * @param parsedTitle     Stream title.
   * @param parsedDuration Stream duration.
   * @param parsedMetas    Stream metadatas.
   */
  private parseInfos(parsedTitle: string, parsedDuration: string, parsedMetas: string): IPlaylistStream {
    const duration: number = parseInt(parsedDuration, 10);
    const metas: {} = {};
    const fakeDiv = window.document.createElement('div');
    const infos: IPlaylistStream = PlaylistParser.createDefaultStream();

    infos.title = parsedTitle || '';
    infos.duration = ((duration < -1) ? -1 : duration);
    // Should be safe as never inserted to dom, but not so elegant...
    // @todo find an alternative
    /* tslint:disable: no-inner-html */
    fakeDiv.innerHTML = `<p ${parsedMetas}></p>`;
    /* tslint:enable: no-inner-html */
    [].slice.call(fakeDiv.firstChild.attributes).forEach(
      (attribute: Attr): void => {
        /* tslint:disable: no-any */
        (<any>metas)[attribute.name] = attribute.value;
        /* tslint:enable: no-any */
      },
    );
    return infos;
  }
}
