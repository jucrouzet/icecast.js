/**
 * Feature detection interface.
 */
export interface IFeature {
  // Feature name.
  name: string;
  // Feature detection test.
  test(): boolean;
}

/**
 * Typeguard for IFeature objects.
 *
 * @return {val is IFeature}
 */
export function isFeature(val: any): val is IFeature { //tslint:disable-line: no-any
  return (
    (typeof (<IFeature>val).name === 'string') &&
    (typeof (<IFeature>val).test === 'function')
  );
}
