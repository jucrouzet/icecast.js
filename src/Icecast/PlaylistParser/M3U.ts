import {PlaylistParser} from './PlaylistParser';
import {PlaylistStream} from './PlaylistStream';
import Logger = require('../../Utils/Logger');

/**
 * M3U(8) files parser.
 */
class M3U extends PlaylistParser {
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
      let currentStream: PlaylistStream;
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
          Logger.Debug(`Ignoring stream "${line}" (not http(s))`);
        }
        if (!currentStream) {
         PlaylistParser.CreateDefaultStream();
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
  private parseInfos(parsedTitle: string, parsedDuration: string, parsedMetas: string): PlaylistStream {
    const duration: number = parseInt(parsedDuration, 10);
    const metas: {} = {};
    const fakeDiv = window.document.createElement('div');
    const infos: PlaylistStream = PlaylistParser.CreateDefaultStream();

    infos.title = parsedTitle || '';
    infos.duration = ((duration < -1) ? -1 : duration);
    // Should be safe as never inserted to dom, but not so elegant...
    // @todo find an alternative
    /* tslint:disable: no-inner-html */
    fakeDiv.innerHTML = `<p ${parsedMetas}></p>`;
    /* tslint:enable: no-inner-html */
    [].slice.call(fakeDiv.firstChild.attributes).forEach(
      (attribute: Attr): void => {
        (<any>metas)[attribute.name] = attribute.value;
      }
    );
    return infos;
  }
}

export = M3U;
