import { Level } from './interface';

export function isPlainObject(value: any) {
  if (Object.prototype.toString.call(value) !== '[object Object]') {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.prototype;
}

export const debounce = (func: () => void, wait: number, immediate?: any) => {
  let timeout: any;
  let args: any;
  let context: any;
  let timestamp: any;
  let result: any;
  if (wait == null) wait = 100;
  function later() {
    const last = Date.now() - timestamp;

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        context = args = null;
      }
    }
  }

  const debounced: any = (...args: any[]) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    context = this;
    timestamp = Date.now();
    const callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args as any);
      context = (args as any) = null;
    }

    return result;
  };

  debounced.clear = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  debounced.flush = () => {
    if (timeout) {
      result = func.apply(context, args);
      context = args = null;

      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
};

export function formatLevel(level: string): Level {
  return level.toLowerCase() as Level;
}

export function formatJsonLogName(name: string): string {
  if (name === null || name === undefined) {
    return name;
  }
  if (/\.log$/.test(name)) {
    return name.replace('.log', '.json.log');
  }
  if (/\.$/.test(name)) {
    return `${name}json.log`;
  }
  return `${name}.json.log`;
}

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

export class template {
  static render(str: string, data: Record<string, any>) {
    return str.replace(/\${(.*?)}/g, (match, key) => data[key]);
  }
}
