import {logger} from '../logger';
import * as Utils from '../utils';
import {APlaylistParser, IPlaylistStream} from './PlaylistParser';

/**
 * M3U(8) files parser.
 */
export class M3U extends APlaylistParser {
  /**
   * Logger.
   */
  private logger: Log = logger('M3U Parser');

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
  public async parse(): Promise<IPlaylistStream[]> {
    return new Promise<IPlaylistStream[]>((resolve: Function, reject: Function): void => {
      let currentStream: IPlaylistStream | void;
      const lines: string[] = this.content.split(/[\r\n]+/);
      const extInfRegex: RegExp = /^\s*#EXTINF\s*:\s*(\-?\d+)(.*),(.*)$/i;

      lines.forEach((rawLine: string): void => {
        const line: string = rawLine.trim();

        if ((line.length === 0) || (line.match(/^\s*#(?!EXTINF)/i))) {
          return;
        }
        if (line.match(extInfRegex)) {
          const [, duration, metas, title] = (<string[]>extInfRegex.exec(line));

          currentStream = this.parseInfos(title, duration, metas);
          return;
        }
        if (!line.match(/^https?:\/\//i)) {
          this.logger.debug(`Ignoring stream "${line}" (not http(s))`);
        }
        if (Utils.isUndefined(currentStream)) {
          currentStream = APlaylistParser.createDefaultStream();
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
    const fakeDiv: HTMLElement = window.document.createElement('div');
    const infos: IPlaylistStream = APlaylistParser.createDefaultStream();

    infos.title = (typeof parsedTitle === 'string') ? '' : parsedTitle;
    infos.duration = ((duration < -1) ? -1 : duration);
    // Should be safe as never inserted to dom, but not so elegant...
    // @todo find an alternative
    /* tslint:disable: no-inner-html */
    fakeDiv.innerHTML = `<p ${parsedMetas}></p>`;
    /* tslint:enable: no-inner-html */
    if (fakeDiv.firstChild !== null) {
      [].slice.call(fakeDiv.firstChild.attributes).forEach(
        (attribute: Attr): void => {
          /* tslint:disable: no-any */
          (<any>metas)[attribute.name] = attribute.value;
          /* tslint:enable: no-any */
        },
      );
    }
    return infos;
  }

}
