/**
 * Used console methods.
 */
const methods: string[] = [
  'assert',
  'clear',
  'dir',
  'Error',
  'group',
  'groupCollapsed',
  'groupEnd',
  'Info',
  'log',
  'profile',
  'profileEnd',
  'table',
  'time',
  'timeEnd',
  'Warn',
];
/**
 * Console object interface.
 */
interface ConsoleObject {
  assert: Function;
  clear: Function;
  dir: Function;
  error: Function;
  group: Function;
  groupCollapsed: Function;
  groupEnd: Function;
  info: Function;
  log: Function;
  profile: Function;
  profileEnd: Function;
  table: Function;
  time: Function;
  timeEnd: Function;
  warn: Function;
}
/**
 * Empty (noop) console object if not available.
 */
class EmptyConsole implements ConsoleObject {
  public assert() { /* noop */  }
  public clear() { /* noop */  }
  public dir() { /* noop */  }
  public error() { /* noop */  }
  public group() { /* noop */  }
  public groupCollapsed() { /* noop */  }
  public groupEnd() { /* noop */  }
  public info() { /* noop */  }
  public log() { /* noop */  }
  public profile() { /* noop */  }
  public profileEnd() { /* noop */  }
  public table() { /* noop */  }
  public time() { /* noop */  }
  public timeEnd() { /* noop */  }
  public warn() { /* noop */  }
}

/**
 * Logger object.
 */
/* tslint:disable: no-stateless-class */
class Logger {
  /**
   * Log currentLevel : Trace.
   */
  public static TRACE: number = 1;
  /**
   * Log currentLevel : Debug.
   */
  public static DEBUG: number = 2;
  /**
   * Log currentLevel : Info.
   */
  public static INFO: number = 3;
  /**
   * Log currentLevel : warning.
   */
  public static WARNING: number = 4;
  /**
   * Log currentLevel : Error.
   */
  public static ERROR: number = 5;

  /**
   * Console object.
   */
  private static console: ConsoleObject;
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
    if ((level < Logger.TRACE) || (level > Logger.ERROR)) {
      throw new Error('Invalid log currentLevel');
    }
    Logger.currentLevel = Math.floor(level);
  }
  /**
   * Get logging currentLevel.
   */
  public static get level(): number {
    return Logger.currentLevel;
  }
  /**
   * Trace Debug something.
   *
   * @param things Things to Trace Debug.
   */
  public static Trace(...things: any[]) {
    Logger.log(Logger.TRACE, things);
  }
  /**
   * Debug something.
   *
   * @param things Things to Debug.
   */
  public static Debug(...things: any[]) {
    Logger.log(Logger.DEBUG, things);
  }
  /**
   * Informs user about something.
   *
   * @param things Things to inform about.
   */
  public static Info(...things: any[]) {
    Logger.log(Logger.INFO, things);
  }
  /**
   * Warns user about something.
   *
   * @param things Things to Warn about.
   */
  public static Warn(...things: any[]) {
    Logger.log(Logger.WARNING, things);
  }
  /**
   * Shows a fatal Error to user.
   *
   * @param things Fatal Error(s).
   */
  public static Error(...things: any[]) {
    Logger.log(Logger.ERROR, things);
  }

  /**
   * Log routine.
   *
   * @param level  Log currentLevel.
   * @param things Things to Debug.
   *
   * @return Nothing.
   */
  private static log(level: number, things: any[]) {
    let logMethod: Function;

    if (!Logger.console) {
      Logger.setupConsole();
    }
    if (level < Logger.currentLevel) {
      return;
    }
    switch (level) {
      case 5:
        logMethod = Logger.console.error;
        break;
      case 4:
        logMethod = Logger.console.warn;
        break;
      case 3:
        logMethod = Logger.console.info;
        break;
      default:
        logMethod = Logger.console.log;
        break;
    }
    Logger.console.group('[ICECAST.JS]');
    logMethod.apply(null, things);
    Logger.console.groupEnd();
  }
  /**
   * Setups console object with browsers capabilities.
   */
  private static setupConsole() {
    Logger.console = new EmptyConsole();
    if (!window.console) {
      return ;
    } else {
      for (const methodName of methods) {
        if (typeof (<any>window.console)[methodName] === 'function') {
          (<any>Logger.console)[methodName] = (<any>window.console)[methodName].bind(window.console);
        } else {
          (<any>Logger.console)[methodName] = () => { /* */ };
        }
      }
    }
  }
}
/* tslint:enable: no-stateless-class */

export = Logger;
