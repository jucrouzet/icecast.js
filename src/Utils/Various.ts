/**
 * Various utilies.
 *
 * @class
 */
export = {
  /**
   * Camel-Case a string.
   */
  Camelize: (value: string): string => {
    return value.replace(/(?:^\w|[A-Z]|\b\w)/g, (letter: string, index: number) => {
      return (index === 0) ? letter.toLowerCase() : letter.toUpperCase();
    }).replace(/\s+/g, '');
  },
};
