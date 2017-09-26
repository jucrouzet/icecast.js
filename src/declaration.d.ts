/**
 * "Variables" defined at compile time by WebPack's DefinePlugin
 */

declare var __LOG_LEVEL__: string;

/**
 * If `bootstrapIcecastJSOnLoad` is true, we bootstrap it on page load.
 */
interface Window { //tslint:disable-line: interface-name
  bootstrapIcecastJSOnLoad: boolean;
}
