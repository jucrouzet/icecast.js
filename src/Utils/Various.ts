/**
 * Various utilies.
 */

/**
 * Camel-Case a string.
 */
export const camelize: Function = (value: string): string => {
  return value.replace(/(?:^\w|[A-Z]|\b\w)/g, (letter: string, index: number) => {
    return (index === 0) ? letter.toLowerCase() : letter.toUpperCase();
  }).replace(/\s+/g, '');
};

/**
 * Find first elem in array that matches a condition.
 *
 * @param array    Array to search on.
 * @param callback Callback to search with value as parameter, returns true if matches.
 */
/* tslint:disable: no-any */
export const arrayFind: Function = (array: any[], callback: (value: any) => boolean): any => {
  if (Object.prototype.toString.call(array) !== '[object Array]') {
    return undefined;
  }
  if (Object.prototype.toString.call(callback) !== '[object Function]') {
    return undefined;
  }
  for (let i: number = 0; i < array.length; i = i + 1) {
    if (callback(array[i])) {
      return callback(array[i]);
    }
  }
  return undefined;
};
/* tslint:enable: no-any */
