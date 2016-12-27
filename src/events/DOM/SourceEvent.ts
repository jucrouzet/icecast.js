/**
 * Player handling.
 *
 * @class
 */
export class SourceEvent extends Event {
  /**
   * Stream's url.
   */
  public url: string;
  /**
   * Stream's mime mimeType.
   */
  public mimeType: string;

  /**
   * Constructor.
   *
   * @param name       Event title.
   * @param url        Stream url.
   * @param [mimeType] Stream mime mimeType.
   */
  constructor(name: string, url: string, mimeType?: string) {
    super(name, {bubbles: true, cancelable: true});
    if (!url) {
      throw new Error('SourceEvent needs a stream url');
    }
    this.url = url;
    this.mimeType = mimeType;
  }
}
