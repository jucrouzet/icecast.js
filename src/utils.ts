/**
 * Various utilies.
 */

/**
 * Camel-Case a string.
 *
 * @todo Handle unicodes
 */
export function camelize(value: string, firstCharLower: boolean = true): string {
  return value
    .split(/[^a-z0-9]+/i)
    .filter((part: String) => part.length > 0)
    .map((part: string, i: number) => {
      const firstLetter: string = part.substr(0, 1);

      return (
        (firstCharLower && i === 0) ? firstLetter.toLowerCase() : firstLetter.toUpperCase()
      ) + part.substr(1).toLowerCase();
    })
    .join('');
}

/**
 * Types checks.
 */

//tslint:disable: no-any
/**
 * If value a string.
 */
export function isString(value: any): value is string {
  return (typeof value === 'string');
}

/**
 * If value a not-empty string.
 */
export function isNotEmptyString(value: any): value is string {
  return (isString(value) && (value.length > 0));
}

/**
 * If value undefined.
 */
export function isUndefined(value: any): value is void {
  return (value === undefined);
}

/**
 * If value an object.
 */
export function isObject(value: any): value is object {
  return (typeof value === 'object');
}

/**
 * If value is a function.
 */
export function isFunction(value: any): value is Function {
  return (typeof value === 'function');
}
//tslint:enable: no-any
