import { TypesUtil } from './types.util';

export class ObjectUtil {
  static isSpecificValue(val: any): boolean {
    return val instanceof Buffer || val instanceof Date || val instanceof RegExp ? true : false;
  }
  static cloneSpecificValue(val): any {
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
  static deepCloneArray(arr): any[] {
    const clone: any[] = [];
    arr.forEach((item: any, index: number) => {
      if (typeof item === 'object' && item !== null) {
        if (Array.isArray(item)) {
          clone[index] = this.deepCloneArray(item);
        } else if (this.isSpecificValue(item)) {
          clone[index] = this.cloneSpecificValue(item);
        } else {
          clone[index] = this.deepExtend({}, item);
        }
      } else {
        clone[index] = item;
      }
    });
    return clone;
  }
  static safeGetProperty(object, property) {
    return property === '__proto__' ? undefined : object[property];
  }
  static deepExtend(...args: any[]): any {
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
        src = this.safeGetProperty(target, key); // source value
        val = this.safeGetProperty(obj, key); // new value

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
          target[key] = this.deepCloneArray(val);
          return;

          // custom cloning and overwrite for specific objects
        } else if (this.isSpecificValue(val)) {
          target[key] = this.cloneSpecificValue(val);
          return;

          // overwrite by new value if source isn't object or array
        } else if (typeof src !== 'object' || src === null || Array.isArray(src)) {
          target[key] = this.deepExtend({}, val);
          return;

          // source value and new value is objects both, extending...
        } else {
          target[key] = this.deepExtend(src, val);
          return;
        }
      });
    });

    return target;
  }
  static extend(...args: any[]): any {
    if (typeof args[0] === 'boolean' && args[0] === true) {
      args = Array.prototype.slice.call(args, 1);
      return this.deepExtend(...args);
    }
    return this.simpleExtend(args[0], ...Array.prototype.slice.call(args, 1));
  }
  static simpleExtend(target: any, ...sources: any[]): any {
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
          target[name] = this.extend(deep, clone, copy);
        } else if (typeof copy !== 'undefined') {
          target[name] = copy;
        }
      }
    }
    return target;
  }
  static merge(target: any, src: any) {
    if (!target) {
      target = src;
      src = null;
    }
    if (!target) {
      return null;
    }
    if (Array.isArray(target)) {
      return target.concat(src || []);
    }
    if (typeof target === 'object') {
      return Object.assign({}, target, src);
    }
    throw new Error('can not merge meta that type of ' + typeof target);
  }
}
