/**
 * Stream handling.
 */
class Stream {
  /**
   * A map of mimeType => method for playlist parsers.
   */
  private playlistTypes: any = {
    'application/xspf+xml': 'parseXSPF',
    'audio/x-mpegurl': 'parseM3U8',
    'audio/x-vclt': 'parseVCLT',
  };
  /**
   * Stream url.
   */
  private url: string;
  /**
   * Is validity checked.
   */
  // private checked: boolean = false;
  /**
   * Is stream valid.
   */
  // private valid: boolean = false;
  /**
   * Audio stream mimetype.
   */
  // private streamMimeType: string;
  /**
   * Playlist file encoding.
   */
  private playlistEncoding: string = 'iso-8859-1';
  /**
   * Playlist file mimetype.
   */
  private playlistMimeType: string;

  /**
   * Constructor.
   *
   * @param url        Stream url.
   * @param [mimeType] Stream's mimetype.
   */
  constructor(url: string, mimeType?: string) {
    const parts: string[] = mimeType && mimeType.split(/\s*;/);
    const charsetGrepper: RegExp = /(?:^|&)charset=([^&]+)/;

    this.url = url;
    if (parts && Array.isArray(parts)) {
      if (this.playlistTypes[parts[0].toLowerCase()]) {
        this.playlistMimeType = parts[0].toLowerCase();
        if (parts[1] && parts[1].match(charsetGrepper)) {
          const grepped = charsetGrepper.exec(parts[1]);

          this.playlistEncoding = grepped[1];
        }
      }
    }
  }

  /**
   * Checks if stream is valid.
   *
   * @return A promise to selection score of valid, promise is reject if invalid.
   */
  public isValid(): Promise<number> {
    return Promise.resolve(1);
    /**
    if (this.playlistMimeType && this.playlistTypes[this.playlistMimeType]) {
      return this.parsePlaylist();
    }


    return fetch(
      this.url,
      {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-cache',
        referrer: window.document && window.document.location && window.document.location.href,
      }
    )
      .catch(() => {
        // @todo : give url
        Logger.Debug('Browser failed to load ${this.url}, this could be a CORS problem,' +
         'please make sure your stream is correctly configured (http://somurl)');
      })
      .then((response: Response) => {
        if (!response) {
          return;
        }
        let mimeType: string = response.headers.get('content-mimeType') || this.playlistMimeType;

        mimeType = mimeType.split(/\s*;/)[0];
        if (this.playlistMimeType && mimeType && (this.playlistMimeType !== mimeType)) {
          Logger.Warn(
            `Stream was declared as ${this.playlistMimeType} but seems to be a "${mimeType}"`
          );
          mimeType = this.playlistMimeType;
        }
        if (!mimeType) {
          throw new Error('Unable to guess stream mimeType');
        }
        if (this.playlistTypes[mimeType]) {
          const method: string = this.playlistTypes[mimeType];

          if (typeof (<any>this)[method] === 'function') {
            return (<any>this)[method](response);
          }
        }
        const audio = new Audio();

        if (!audio.canPlayType(mimeType)) {
          throw new Error(`Browser cannot play ${mimeType} streams`);
        }
        return undefined;
      })
      .then(() => {
        this.checked = this.valid = true;
      });
     return Promise.resolve(0.1);
     */
  }
  /**
   * Get stream mime mimeType.
   */
  public get mimeType(): string {
    return this.playlistMimeType;
  }

  /**
   * Tries to guess the mimetype with the extension in url.
   *
   * @param givenUrl Url to parse.
   *
   * @return Mimetype or undefined if could not guess.

  private guessTypeByExtension(givenUrl: string): string {
    if (!givenUrl) {
      return;
    }
    const urlObj = url.parse(givenUrl);

    if (!urlObj || !urlObj.pathname) {
      return;
    }
    switch (path.extname(urlObj.pathname).toLowerCase()) {
      case '.xspf' :
        return 'application/xspf+xml';
      case '.m3u' :
      case '.m3u8' :
        return 'audio/x-mpegurl';
      case '.vclt' :
        return 'audio/x-vclt';
      case '.mp3' :
        return 'audio/mpeg';
      case '.aac' :
        return 'audio/aac';
      case '.ogg' :
        return 'audio/ogg';
      default:
        return;
    }
  }
  */
  /**
   * Parses stream's playlist file.

  private parsePlaylist(): Promise<number> {
    return Promise.resolve(1);
  }
  */
  /**
   * Parses a XSPF playlist.

  private parseXSPF(response: Response): Promise<void> {
    return Promise.resolve();
  }
  */
  /**
   * Parses a M3U8 playlist.

  private parseM3U8(response: Response): Promise<void> {
    return Promise.resolve();
  }
  */
  /**
   * Parses a VCLT playlist.

  private parseVCLT(response: Response): Promise<void> {
    return Promise.resolve();
  }
  */
}

export = Stream;
