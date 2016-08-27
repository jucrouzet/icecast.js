import Bluebird = require('bluebird');

/* tslint:disable: no-string-literal */
const jQuery: JQueryStatic = (<any>window)['jQuery'];
/* tslint:enable: no-string-literal */
/**
 * Page manipulation helpers.
 */
const pageManipulation = {
  /**
   * Insert an HTML file into page's test content div.
   *
   * @param file HTML file name.
   */
  appendContent: (file: string): Bluebird<any> => {
    return new Bluebird((resolve: Function, reject: Function): void => {
      const url = `./test/fixtures/html/${file}`;

      jQuery.ajax({
        url,
        success: (data: string) => {
          /* tslint:disable: no-inner-html */
          jQuery('#testContainer').html(data);
          /* tslint:enable: no-inner-html */
          resolve(data);
        },
        error  : (jqXHR: any, status: string) => {
          reject(new Error(`${status} while injecting ${url}`));
        },
      });
    });
  },
  /**
   * Replace page's test content div with a HTML file.
   *
   * @param file HTML file name.
   */
  replaceContentWith: (file: string): Bluebird<any> => {
    pageManipulation.removeContent();
    return pageManipulation.appendContent(file);
  },
  /**
   * Remove page's test content.
   */
  removeContent: (): void => {
    jQuery('#testContainer').empty();
  },

};

export = pageManipulation;
