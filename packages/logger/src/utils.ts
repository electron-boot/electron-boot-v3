import { Level } from './interface';

/**
 * Convert str to Level
 * @param level {string} - level str
 */
export function formatLevel(level: string): Level {
  return level.toLowerCase() as Level;
}

/**
 * if name is undefined or name, throw error
 * @param name
 * @param message
 */
export function assertEmptyAndThrow(name: string, message: any) {
  if (name === null || name === undefined) {
    throw new Error(message);
  }
}

/**
 * 只要有一个 false 就返回 true
 * 默认为 undefined, null, false 时返回 true
 * @param args
 */
export function assertConditionTruthy(...args: any[]): boolean {
  if (args && args.length) {
    for (const param of args) {
      if (param !== true) {
        continue;
      } else {
        return false;
      }
    }
  }
  return true;
}

/**
 * render template to str
 * @param str {string} - template str
 * @param data {Record<string,any>} - template data
 */
export function template(str: string, data: Record<string, any>) {
  return str.replace(/\${(.*?)}/g, (match, key) => data[key]);
}
