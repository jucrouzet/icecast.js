/**
 * Console object wrapper/configurator.
 */

const noop: Function = (): void => null;

/**
 * Console methods => min logging level.
 */
interface IMethodLevels {
  [name: string]: number;
}
const methodLevels: IMethodLevels = {
  assert        : 1,
  dir           : 1,
  debug         : 1,
  error         : 4,
  group         : 1,
  groupCollapsed: 1,
  groupEnd      : 1,
  info          : 2,
  log           : 1,
  profile       : 1,
  profileEnd    : 1,
  table         : 1,
  time          : 1,
  timeEnd       : 1,
  warn          : 3,
};
/**
 * Console object interface.
 */
interface IConsoleObject {
  assert        : Function;
  clear         : Function;
  dir           : Function;
  debug         : Function;
  error         : Function;
  group         : Function;
  groupCollapsed: Function;
  groupEnd      : Function;
  info          : Function;
  log           : Function;
  profile       : Function;
  profileEnd    : Function;
  table         : Function;
  time          : Function;
  timeEnd       : Function;
  warn          : Function;
}
/**
 * Empty (noop) console object if not available.
 */
const emptyConsole: IConsoleObject = {
  assert        : noop,
  clear         : noop,
  dir           : noop,
  debug         : noop,
  error         : noop,
  group         : noop,
  groupCollapsed: noop,
  groupEnd      : noop,
  info          : noop,
  log           : noop,
  profile       : noop,
  profileEnd    : noop,
  table         : noop,
  time          : noop,
  timeEnd       : noop,
  warn          : noop,
};

/**
 * Logger object.
 */
/* tslint:disable: no-stateless-class no-any function-name */
export class Logger {
  /**
   * Log currentLevel : Debug.
   */
  public static DEBUG: number = 1;
  /**
   * Log currentLevel : Info.
   */
  public static INFO: number = 2;
  /**
   * Log currentLevel : warning.
   */
  public static WARNING: number = 3;
  /**
   * Log currentLevel : Error.
   */
  public static ERROR: number = 4;

  /**
   * Console object.
   */
  private static consoleObject: IConsoleObject = emptyConsole;
  /**
   * Current logging currentLevel.
   */
  private static currentLevel: number = 4;

  /**
   * Constructor.
   */
  constructor() {
    throw new Error('Logger should not be instantiated');
  }

  /**
   * Set logging currentLevel.
   *
   * @param level Logging currentLevel (see Logger.* properties).
   */
  public static set level(level: number) {
    if ((level < Logger.DEBUG) || (level > Logger.ERROR)) {
      throw new Error('Invalid log currentLevel');
    }
    Logger.currentLevel = Math.floor(level);
    Logger.setupConsole();
  }

  /**
   * Get logging currentLevel.
   */
  public static get level(): number {
    return Logger.currentLevel;
  }

  /**
   * Get the console object.
   */
  public static get send(): IConsoleObject {
    return Logger.consoleObject;
  }

  /**
   * Setups console object with browsers capabilities.
   */
  private static setupConsole() {
    Logger.consoleObject = emptyConsole;
    if (!window.console) {
      return;
    } else {
      Object.keys(methodLevels).forEach((method: string): void => {
        if (
          (methodLevels[method] >= Logger.level) &&
          (typeof (<any>window.console)[method] === 'function')
        ) {
          (<any>Logger.consoleObject)[method] =
            (<any>window.console)[method].bind(window.console);
        }
      });
      Logger.consoleObject.debug = Logger.consoleObject.log;
    }
  }
}
/* tslint:enable: no-stateless-class no-any function-name */
