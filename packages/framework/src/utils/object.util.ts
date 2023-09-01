import { TypesUtil } from './types.util';

export function isSpecificValue(val: any): boolean {
  return val instanceof Buffer || val instanceof Date || val instanceof RegExp ? true : false;
}
export function cloneSpecificValue(val): any {
  if (val instanceof Buffer) {
    const x = Buffer.alloc ? Buffer.alloc(val.length) : Buffer.from(val);
    val.copy(x);
    return x;
  } else if (val instanceof Date) {
    return new Date(val.getTime());
  } else if (val instanceof RegExp) {
    return new RegExp(val);
  } else {
    throw new Error('Unexpected situation');
  }
}
export function deepCloneArray(arr): any[] {
  const clone: any[] = [];
  arr.forEach((item: any, index: number) => {
    if (typeof item === 'object' && item !== null) {
      if (Array.isArray(item)) {
        clone[index] = deepCloneArray(item);
      } else if (isSpecificValue(item)) {
        clone[index] = cloneSpecificValue(item);
      } else {
        clone[index] = deepExtend({}, item);
      }
    } else {
      clone[index] = item;
    }
  });
  return clone;
}
export function safeGetProperty(object, property) {
  return property === '__proto__' ? undefined : object[property];
}
export function deepExtend(...args: any[]): any {
  if (args.length < 1 || typeof args[0] !== 'object') {
    return false;
  }

  if (args.length < 2) {
    return args[0];
  }

  const target = args[0];

  // convert arguments to array and cut off target object
  args = Array.prototype.slice.call(args, 1);

  let val: any, src: any;

  args.forEach(obj => {
    // skip argument if isn't an object, is null, or is an array
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      return;
    }

    Object.keys(obj).forEach(key => {
      src = safeGetProperty(target, key); // source value
      val = safeGetProperty(obj, key); // new value

      // recursion prevention
      if (val === target) {
        return;

        /**
         * if new value isn't object then just overwrite by new value
         * instead of extending.
         */
      } else if (typeof val !== 'object' || val === null) {
        target[key] = val;
        return;

        // just clone arrays (and recursive clone objects inside)
      } else if (Array.isArray(val)) {
        target[key] = deepCloneArray(val);
        return;

        // custom cloning and overwrite for specific objects
      } else if (isSpecificValue(val)) {
        target[key] = cloneSpecificValue(val);
        return;

        // overwrite by new value if source isn't object or array
      } else if (typeof src !== 'object' || src === null || Array.isArray(src)) {
        target[key] = deepExtend({}, val);
        return;

        // source value and new value is objects both, extending...
      } else {
        target[key] = deepExtend(src, val);
        return;
      }
    });
  });

  return target;
}
export function extend(...args: any[]): any {
  if (typeof args[0] === 'boolean' && args[0] === true) {
    args = Array.prototype.slice.call(args, 1);
    return deepExtend(...args);
  }
  return simpleExtend(args[0], ...Array.prototype.slice.call(args, 1));
}
export function simpleExtend(target: any, ...sources: any[]): any {
  let options: { [x: string]: any }, name: string, src: any, copy: any, clone: any;
  const length = sources.length;
  let i: number = 0;
  let deep = false;
  if (typeof target === 'boolean') {
    deep = target;
    target = sources[0] || {};
    i = 1;
  } else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
    target = {};
  }
  for (; i < length; ++i) {
    options = sources[i];
    if (options == null) continue;
    for (name in options) {
      if (name === '__proto__') continue;
      src = target[name];
      copy = options[name];
      if (target === copy) continue;
      if (deep && copy && TypesUtil.isPlainObject(copy)) {
        clone = src && TypesUtil.isPlainObject(src) ? src : {};
        target[name] = extend(deep, clone, copy);
      } else if (typeof copy !== 'undefined') {
        target[name] = copy;
      }
    }
  }
  return target;
}
